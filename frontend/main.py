"""FastAPI proxy for a deployed A2A agent (Agent Runtime, agents-cli 1.1.0+).

Provides real-time Server-Sent Events (SSE) streaming at /chat/stream,
as well as standard request-response at /chat.
"""

import asyncio
import base64
import json
import os
import uuid

import google.auth
import google.auth.transport.requests
from google.cloud import storage
import httpx
from a2a.client import ClientConfig, ClientFactory
from a2a.types import (
    AgentCard,
    FilePart,
    Message,
    Part,
    Role,
    TaskArtifactUpdateEvent,
    TaskStatusUpdateEvent,
    TextPart,
    TransportProtocol,
)
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

RESOURCE = os.environ.get(
    "AGENT_ENGINE_RESOURCE_NAME",
    "projects/499646950345/locations/us-east1/reasoningEngines/8960278695537278976",
)
AGENT_DIRECTORY = os.environ.get("AGENT_DIRECTORY", "app")
LOCATION = RESOURCE.split("/locations/")[1].split("/")[0]

A2A_BASE = (
    f"https://{LOCATION}-aiplatform.googleapis.com/reasoningEngines/v1/"
    f"{RESOURCE}/api/a2a/{AGENT_DIRECTORY}"
)
A2A_CARD_URL = f"{A2A_BASE}/.well-known/agent-card.json"

_A2UI_MIME = "application/json+a2ui"

_creds, _ = google.auth.default(
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)


def _auth_headers() -> dict[str, str]:
    _creds.refresh(google.auth.transport.requests.Request())
    return {
        "Authorization": f"Bearer {_creds.token}",
        "Content-Type": "application/json",
    }


app = FastAPI()


@app.exception_handler(Exception)
async def _json_errors(request: Request, exc: Exception):
    return JSONResponse(
        status_code=200,
        content={
            "parts": [{"kind": "text", "text": f"Error: {type(exc).__name__}: {exc}"}]
        },
    )


_contexts: dict[str, str] = {}
_card: AgentCard | None = None


async def _get_card(client: httpx.AsyncClient) -> AgentCard:
    global _card
    if _card is None:
        resp = await client.get(A2A_CARD_URL)
        resp.raise_for_status()
        card = AgentCard(**resp.json())
        card.url = A2A_BASE
        _card = card
    return _card


def _extract_parts(parts: list) -> list[dict]:
    out: list[dict] = []
    for p in parts:
        root = getattr(p, "root", p)
        if isinstance(root, TextPart) and getattr(root, "text", None):
            out.append({"kind": "text", "text": root.text})
        elif getattr(root, "data", None) is not None:
            meta = getattr(root, "metadata", None) or {}
            mime = meta.get("mimeType") if isinstance(meta, dict) else None
            if mime == _A2UI_MIME:
                out.append({"kind": "a2ui", "data": root.data})
        elif isinstance(root, FilePart):
            uri = getattr(getattr(root, "file", None), "uri", None)
            if uri:
                out.append({"kind": "text", "text": uri})
    return out


def _prepare_user_message(message: str, image_data: str | None) -> str:
    if not image_data:
        return message

    try:
        header, encoded = image_data.split(",", 1) if "," in image_data else ("", image_data)
        img_bytes = base64.b64decode(encoded)
        mime_type = "image/jpeg"
        ext = "jpg"
        if "image/png" in header:
            mime_type = "image/png"
            ext = "png"
        elif "image/webp" in header:
            mime_type = "image/webp"
            ext = "webp"

        storage_client = storage.Client(credentials=_creds, project="qwiklabs-gcp-04-1a63b44d06d9")
        bucket_name = "collector-assistant-media-1a63b44d06d9"
        bucket = storage_client.bucket(bucket_name)
        filename = f"uploads/camera_{uuid.uuid4().hex[:8]}.{ext}"
        blob = bucket.blob(filename)
        blob.upload_from_string(img_bytes, content_type=mime_type)
        uploaded_image_url = f"https://storage.googleapis.com/{bucket_name}/{filename}"

        camera_note = f"I captured a photo of an item using my camera: {uploaded_image_url}\n"
        if message:
            return f"{camera_note}{message}\nPlease use verify_and_inspect_collectible to evaluate whether this item is a collectible or not, identify its category and condition, and provide your verdict."
        else:
            return f"{camera_note}Please inspect this photo with verify_and_inspect_collectible: check if it is a collectible or not, identify its category and condition, and provide your verdict."
    except Exception as e:
        print(f"Failed to upload camera image: {e}")
        return message


@app.post("/chat/stream")
async def chat_stream(req: Request):
    body = await req.json()
    raw_message = body.get("message", "")
    image_data = body.get("image_data")
    user_id = body.get("user_id") or "web-user"

    async def sse_generator():
        try:
            yield f"data: {json.dumps({'kind': 'status', 'text': 'Consulting curator...'})}\n\n"

            if image_data:
                yield f"data: {json.dumps({'kind': 'status', 'text': 'Uploading inspection photo...'})}\n\n"

            message = _prepare_user_message(raw_message, image_data)

            if image_data:
                yield f"data: {json.dumps({'kind': 'status', 'text': 'Inspecting collectible authenticity & grade...'})}\n\n"

            async with httpx.AsyncClient(headers=_auth_headers(), timeout=120) as client:
                card = await _get_card(client)
                factory = ClientFactory(
                    ClientConfig(
                        supported_transports=[
                            TransportProtocol.jsonrpc,
                            TransportProtocol.http_json,
                        ],
                        httpx_client=client,
                    )
                )
                a2a_client = factory.create(card)

                msg = Message(
                    message_id=str(uuid.uuid4()),
                    role=Role.user,
                    parts=[Part(root=TextPart(text=message))],
                    context_id=_contexts.get(user_id),
                )

                last_task = None
                got_artifact_update = False
                emitted_text_len = 0

                async for event in a2a_client.send_message(msg):
                    if not isinstance(event, tuple):
                        continue
                    task, update = event
                    if task is not None:
                        last_task = task
                        if getattr(task, "context_id", None):
                            _contexts[user_id] = task.context_id

                    if isinstance(update, TaskStatusUpdateEvent):
                        status_obj = getattr(update, "status", None)
                        msg_obj = getattr(status_obj, "message", None) if status_obj else None
                        if msg_obj and getattr(msg_obj, "parts", None):
                            for p in _extract_parts(msg_obj.parts):
                                if p.get("kind") == "text":
                                    curr_text = p.get("text", "")
                                    if len(curr_text) > emitted_text_len:
                                        delta = curr_text[emitted_text_len:]
                                        emitted_text_len = len(curr_text)
                                        # Yield progressive words
                                        words = delta.split(" ")
                                        for i, w in enumerate(words):
                                            chunk = w if i == len(words) - 1 else w + " "
                                            yield f"data: {json.dumps({'kind': 'delta', 'delta': chunk})}\n\n"
                                            await asyncio.sleep(0.01)
                                elif p.get("kind") == "a2ui":
                                    yield f"data: {json.dumps(p)}\n\n"
                        elif getattr(status_obj, "state", None) == "working":
                            yield f"data: {json.dumps({'kind': 'status', 'text': 'Searching catalog & evaluating records...'})}\n\n"

                    elif isinstance(update, TaskArtifactUpdateEvent):
                        got_artifact_update = True
                        if getattr(update, "artifact", None):
                            for p in _extract_parts(update.artifact.parts):
                                if p.get("kind") == "text":
                                    curr_text = p.get("text", "")
                                    if len(curr_text) > emitted_text_len:
                                        delta = curr_text[emitted_text_len:]
                                        emitted_text_len = len(curr_text)
                                        words = delta.split(" ")
                                        for i, w in enumerate(words):
                                            chunk = w if i == len(words) - 1 else w + " "
                                            yield f"data: {json.dumps({'kind': 'delta', 'delta': chunk})}\n\n"
                                            await asyncio.sleep(0.01)
                                elif p.get("kind") == "a2ui":
                                    yield f"data: {json.dumps(p)}\n\n"

                # Fallback: if no artifact updates were streamed
                if not got_artifact_update and last_task is not None:
                    for artifact in getattr(last_task, "artifacts", None) or []:
                        for p in _extract_parts(artifact.parts):
                            if p.get("kind") == "text":
                                curr_text = p.get("text", "")
                                if len(curr_text) > emitted_text_len:
                                    delta = curr_text[emitted_text_len:]
                                    emitted_text_len = len(curr_text)
                                    yield f"data: {json.dumps({'kind': 'delta', 'delta': delta})}\n\n"
                            elif p.get("kind") == "a2ui":
                                yield f"data: {json.dumps(p)}\n\n"

                if emitted_text_len == 0 and not got_artifact_update:
                    yield f"data: {json.dumps({'kind': 'delta', 'delta': '(The agent did not return a reply.)'})}\n\n"

            yield f"data: {json.dumps({'kind': 'done'})}\n\n"

        except Exception as exc:
            print(f"Streaming error: {exc}")
            yield f"data: {json.dumps({'kind': 'error', 'error': str(exc)})}\n\n"

    return StreamingResponse(
        sse_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    raw_message = body.get("message", "")
    image_data = body.get("image_data")
    user_id = body.get("user_id") or "web-user"
    parts: list[dict] = []

    message = _prepare_user_message(raw_message, image_data)

    async with httpx.AsyncClient(headers=_auth_headers(), timeout=120) as client:
        card = await _get_card(client)
        factory = ClientFactory(
            ClientConfig(
                supported_transports=[
                    TransportProtocol.jsonrpc,
                    TransportProtocol.http_json,
                ],
                httpx_client=client,
            )
        )
        a2a_client = factory.create(card)

        msg = Message(
            message_id=str(uuid.uuid4()),
            role=Role.user,
            parts=[Part(root=TextPart(text=message))],
            context_id=_contexts.get(user_id),
        )

        last_task = None
        got_artifact_update = False
        async for event in a2a_client.send_message(msg):
            if not isinstance(event, tuple):
                continue
            task, update = event
            if task is not None:
                last_task = task
                if getattr(task, "context_id", None):
                    _contexts[user_id] = task.context_id
            if isinstance(update, TaskArtifactUpdateEvent):
                got_artifact_update = True
                parts.extend(_extract_parts(update.artifact.parts))

        if not got_artifact_update and last_task is not None:
            for artifact in getattr(last_task, "artifacts", None) or []:
                parts.extend(_extract_parts(artifact.parts))

    if not parts:
        parts = [{"kind": "text", "text": "(The agent didn't return a reply.)"}]
    return JSONResponse({"parts": parts})


# Serve the chat UI
app.mount("/", StaticFiles(directory="static", html=True), name="static")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
