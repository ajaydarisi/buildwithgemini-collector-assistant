# ruff: noqa
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import base64
import json
import os
import re
from typing import Any
import uuid

from dotenv import load_dotenv
from google import genai
from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.code_executors import AgentEngineSandboxCodeExecutor
from google.adk.models import Gemini
from google.adk.tools import ToolContext
from google.cloud import firestore, storage
from google.genai import types
import requests

load_dotenv()

MODEL = "gemini-3.6-flash"
IMAGE_MODEL = "gemini-3.1-flash-lite-image"
VIDEO_MODEL = "gemini-omni-flash-preview"

# Hardcoded project ID as required (avoiding google.auth.default() / GOOGLE_CLOUD_PROJECT project number issues)
PROJECT_ID = "qwiklabs-gcp-04-1a63b44d06d9"
COLLECTION_NAME = "collectibles"
BUCKET_NAME = "collector-assistant-media-1a63b44d06d9"

# Agent Engine & Sandbox execution environment (Agent Platform)
AGENT_ENGINE_RESOURCE_NAME = "projects/499646950345/locations/us-east1/reasoningEngines/8960278695537278976"
SANDBOX_RESOURCE_NAME = (
    "projects/499646950345/locations/us-east1/reasoningEngines/8960278695537278976/sandboxEnvironments/1775060367974596608"
)

sandbox_executor = AgentEngineSandboxCodeExecutor(
    sandbox_resource_name=SANDBOX_RESOURCE_NAME,
    agent_engine_resource_name=AGENT_ENGINE_RESOURCE_NAME,
)

_db = None
_storage_client = None


def get_db():
    global _db
    if _db is None:
        _db = firestore.Client(project=PROJECT_ID)
    return _db


def get_storage_client():
    global _storage_client
    if _storage_client is None:
        _storage_client = storage.Client(project=PROJECT_ID)
    return _storage_client


def search_collectibles(query: str = "", category: str = "", max_price: float = 0.0) -> list[dict[str, Any]]:
    """Search and browse the collectibles marketplace catalog in Firestore.

    Args:
        query: Optional text to search for in item names or descriptions (e.g. "Charizard", "Jordan", "Mario").
        category: Optional category filter (e.g. "Trading Cards", "Sneakers", "Watches", "Retro Gaming", "Vinyl Records").
        max_price: Optional maximum price filter in USD (e.g. 10000.0). If 0.0, no price ceiling is applied.

    Returns:
        A list of matching collectible items with their id, name, category, condition, price, and status.
    """
    db = get_db()
    docs = db.collection(COLLECTION_NAME).stream()
    results = []

    q_lower = query.strip().lower() if query else ""
    cat_lower = category.strip().lower() if category else ""

    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id

        # Category filter
        if cat_lower and cat_lower not in item.get("category", "").lower():
            continue

        # Max price filter
        if max_price > 0 and float(item.get("price", 0.0)) > max_price:
            continue

        # Text query filter
        if q_lower:
            name = item.get("name", "").lower()
            desc = item.get("description", "").lower()
            if q_lower not in name and q_lower not in desc:
                continue

        results.append(item)

    return results


def get_collectible_details(item_id: str) -> dict[str, Any]:
    """Retrieve full details of a specific collectible by its ID.

    Args:
        item_id: The unique ID of the collectible item (e.g. "card-charizard-1999").

    Returns:
        The item dictionary if found, or an error message if not found.
    """
    db = get_db()
    doc_ref = db.collection(COLLECTION_NAME).document(item_id)
    doc = doc_ref.get()
    if not doc.exists:
        return {"error": f"Item '{item_id}' not found in catalog."}
    data = doc.to_dict()
    data["id"] = doc.id
    return data


def add_collectible(name: str, category: str, condition: str, price: float, description: str) -> dict[str, Any]:
    """Add a new collectible item/listing to the Firestore marketplace catalog.

    Args:
        name: The title/name of the collectible item.
        category: The item category (e.g. "Trading Cards", "Sneakers", "Watches", "Retro Gaming", "Vinyl Records").
        condition: The item condition or grade (e.g. "PSA 10 Gem Mint", "Deadstock", "Near Mint").
        price: Price in USD.
        description: Detailed notes regarding provenance, rarity, and edition.

    Returns:
        A confirmation dict containing the created item ID and details.
    """
    db = get_db()
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:30]
    item_id = f"{slug}-{int(price)}"

    item_data = {
        "id": item_id,
        "name": name,
        "category": category,
        "condition": condition,
        "price": float(price),
        "description": description,
        "status": "available",
        "market_trend": "stable",
    }

    db.collection(COLLECTION_NAME).document(item_id).set(item_data)
    return {"status": "success", "message": f"Successfully listed '{name}'", "item": item_data}


def update_collectible_status(item_id: str, status: str) -> dict[str, Any]:
    """Update the status of a collectible item in Firestore (e.g. mark as 'sold', 'reserved', or 'available').

    Args:
        item_id: The unique ID of the collectible item.
        status: The new status ('available', 'reserved', or 'sold').

    Returns:
        Confirmation dictionary with the updated item information.
    """
    valid_statuses = ["available", "reserved", "sold"]
    normalized_status = status.strip().lower()
    if normalized_status not in valid_statuses:
        return {"error": f"Invalid status '{status}'. Must be one of: {', '.join(valid_statuses)}"}

    db = get_db()
    doc_ref = db.collection(COLLECTION_NAME).document(item_id)
    doc = doc_ref.get()
    if not doc.exists:
        return {"error": f"Item '{item_id}' not found."}

    doc_ref.update({"status": normalized_status})
    return {"status": "success", "item_id": item_id, "new_status": normalized_status}


def estimate_market_value(item_name: str, condition: str = "Near Mint", category: str = "") -> dict[str, Any]:
    """Appraise and estimate the fair market value of a collectible item based on condition grade and comparable catalog data.

    Args:
        item_name: The name or keywords of the collectible (e.g. "Charizard", "Jordan 1", "Black Lotus", "Speedmaster").
        condition: The grade or condition (e.g. "PSA 10 Gem Mint", "PSA 9 Mint", "PSA 8 NM", "Deadstock", "Vintage Excellent", "Raw / Good").
        category: Optional category (e.g. "Trading Cards", "Sneakers", "Watches", "Retro Gaming", "Vinyl Records").

    Returns:
        A dictionary containing the base benchmark, condition multiplier, estimated fair market value, and low/high price range.
    """
    db = get_db()
    docs = db.collection(COLLECTION_NAME).stream()

    # Find closest comparable in catalog to anchor baseline
    base_price = 1000.0
    comp_name = "Market Baseline"
    name_lower = item_name.strip().lower()

    for doc in docs:
        item = doc.to_dict()
        curr_name = item.get("name", "").lower()
        if any(word in curr_name for word in name_lower.split() if len(word) > 2):
            base_price = float(item.get("price", 1000.0))
            comp_name = item.get("name", "Catalog Comparable")
            break

    # Determine condition multiplier
    cond_lower = condition.strip().lower()
    if any(k in cond_lower for k in ["10", "gem mint", "pristine", "sealed"]):
        multiplier = 1.8
        tier = "Pristine / Gem Mint"
    elif any(k in cond_lower for k in ["9", "deadstock", "nm-mt", "mint"]):
        multiplier = 1.3
        tier = "Mint / Deadstock"
    elif any(k in cond_lower for k in ["8", "excellent", "nm"]):
        multiplier = 1.0
        tier = "Near Mint / Excellent"
    elif any(k in cond_lower for k in ["7", "6", "vg+", "very good"]):
        multiplier = 0.65
        tier = "Very Good / Lightly Played"
    else:
        multiplier = 0.45
        tier = "Fair / Moderate Wear"

    estimated_value = round(base_price * multiplier, 2)
    low_estimate = round(estimated_value * 0.85, 2)
    high_estimate = round(estimated_value * 1.18, 2)

    return {
        "item_name": item_name,
        "condition": condition,
        "condition_tier": tier,
        "condition_multiplier": multiplier,
        "comparable_reference": comp_name,
        "estimated_fair_market_value": estimated_value,
        "low_estimate": low_estimate,
        "high_estimate": high_estimate,
        "currency": "USD",
    }


def geocode_address(address: str) -> dict[str, Any]:
    """Convert an address or location name into geographic coordinates (latitude, longitude) using the Geocoding API.

    Args:
        address: The address or place to geocode (e.g. "1600 Amphitheatre Pkwy, Mountain View, CA" or "Union Square, San Francisco").

    Returns:
        A dictionary with the formatted address and location coordinates (latitude and longitude).
    """
    api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    if not api_key:
        return {"error": "GOOGLE_MAPS_API_KEY environment variable is not configured."}

    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": address, "key": api_key}
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if data.get("status") == "OK" and data.get("results"):
            first = data["results"][0]
            loc = first.get("geometry", {}).get("location", {})
            return {
                "name": address,
                "address": first.get("formatted_address"),
                "location": {
                    "latitude": loc.get("lat"),
                    "longitude": loc.get("lng"),
                },
            }
        else:
            return {"error": data.get("error_message") or f"Geocoding failed with status: {data.get('status')}"}
    except Exception as e:
        return {"error": f"Geocoding request failed: {str(e)}"}


def find_nearby_places(
    latitude: float,
    longitude: float,
    place_type: str = "store",
    radius_meters: float = 5000.0,
    max_results: int = 5,
) -> list[dict[str, Any]]:
    """Find nearby places of a given type around coordinates using the Places API (New) Nearby Search.

    Args:
        latitude: The latitude coordinate (e.g. 37.7749).
        longitude: The longitude coordinate (e.g. -122.4194).
        place_type: Type of place to search for (e.g. "store", "book_store", "clothing_store", "art_gallery", "museum", "shopping_mall").
        radius_meters: Search radius around coordinates in meters (default 5000.0, max 50000.0).
        max_results: Maximum number of places to return (default 5, up to 20).

    Returns:
        A list of nearby places with key fields: name, address, and location coordinates.
    """
    api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    if not api_key:
        return [{"error": "GOOGLE_MAPS_API_KEY environment variable is not configured."}]

    url = "https://places.googleapis.com/v1/places:searchNearby"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location",
    }
    payload = {
        "includedTypes": [place_type],
        "maxResultCount": max(1, min(max_results, 20)),
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": float(latitude),
                    "longitude": float(longitude),
                },
                "radius": float(radius_meters),
            }
        },
    }
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        data = resp.json()
        if "places" in data:
            results = []
            for p in data["places"]:
                display_name = p.get("displayName", {}).get("text", "")
                results.append({
                    "name": display_name,
                    "address": p.get("formattedAddress", ""),
                    "location": {
                        "latitude": p.get("location", {}).get("latitude"),
                        "longitude": p.get("location", {}).get("longitude"),
                    },
                })
            return results
        elif "error" in data:
            return [{"error": data["error"].get("message", "Places API error")}]
        else:
            return []
    except Exception as e:
        return [{"error": f"Places request failed: {str(e)}"}]


async def generate_collectible_image(
    item_name: str,
    prompt_description: str,
    tool_context: ToolContext,
) -> dict[str, Any]:
    """Generate a showcase image for a collectible item using gemini-3.1-flash-lite-image in the global region.

    The generated image is saved to the session artifacts for the Playground's Artifacts panel,
    and uploaded to Cloud Storage to produce a public https URL.

    Args:
        item_name: The name of the collectible item (e.g. "1999 Charizard 1st Edition", "Air Jordan 1 Chicago 1985").
        prompt_description: Visual description for the image generation (e.g. "A pristine vintage holographic Charizard trading card in an acrylic slab, dramatic lighting").

    Returns:
        A dictionary with the item name, artifact filename, and public HTTPS URL of the uploaded image.
    """
    genai_client = genai.Client(vertexai=True, project=PROJECT_ID, location="global")
    full_prompt = f"Showcase photograph of collectible: {item_name}. {prompt_description}"

    try:
        response = genai_client.models.generate_content(
            model=IMAGE_MODEL,
            contents=full_prompt,
            config=types.GenerateContentConfig(
                response_modalities=[types.Modality.IMAGE],
            ),
        )
    except Exception as e:
        return {"error": f"Image generation failed: {str(e)}"}

    image_bytes = None
    mime_type = "image/jpeg"
    if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                image_bytes = part.inline_data.data
                if part.inline_data.mime_type:
                    mime_type = part.inline_data.mime_type
                break

    if not image_bytes:
        return {"error": "No image data was generated by the model."}

    ext = "png" if "png" in mime_type else "jpg"
    slug = re.sub(r"[^a-z0-9]+", "_", item_name.lower()).strip("_")[:30]
    filename = f"{slug}_{uuid.uuid4().hex[:8]}.{ext}"

    # 1. Save artifact with tool_context.save_artifact for Playground Artifacts panel
    if tool_context:
        try:
            artifact_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            await tool_context.save_artifact(filename=filename, artifact=artifact_part)
        except Exception as e:
            print(f"Warning: Failed to save artifact in tool_context: {e}")

    # 2. Upload image bytes directly to public Cloud Storage bucket (no local file)
    try:
        storage_cl = get_storage_client()
        bucket = storage_cl.bucket(BUCKET_NAME)
        blob = bucket.blob(f"images/{filename}")
        blob.upload_from_string(image_bytes, content_type=mime_type)
        public_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{blob.name}"
    except Exception as e:
        return {"error": f"Failed to upload image to Cloud Storage: {str(e)}"}

    return {
        "status": "success",
        "item_name": item_name,
        "artifact_filename": filename,
        "public_image_url": public_url,
    }


async def generate_collectible_video(
    item_name: str,
    prompt_description: str,
    tool_context: ToolContext,
) -> dict[str, Any]:
    """Generate a short showcase video for a collectible item using Google's Omni model (gemini-omni-flash-preview) in the global region.

    The generated video is saved to session artifacts for the Playground's Artifacts panel,
    and uploaded to Cloud Storage to produce a public https URL.

    Args:
        item_name: The name of the collectible item (e.g. "1986 Fleer Michael Jordan Rookie Card", "1999 Charizard Holo 1st Edition", "Patek Philippe Nautilus").
        prompt_description: Detailed visual description of the motion and scene (e.g. "A pristine graded card slowly rotating on a black velvet pedestal under dramatic studio lighting with subtle light reflections").

    Returns:
        A dictionary with the item name, artifact filename, and public HTTPS URL of the uploaded video.
    """
    genai_client = genai.Client(vertexai=True, project=PROJECT_ID, location="global")
    full_prompt = (
        f"A cinematic high-definition showcase video of rare collectible: {item_name}. "
        f"{prompt_description}. Smooth continuous motion, photorealistic lighting, dramatic presentation."
    )

    try:
        interaction = genai_client.interactions.create(
            model=VIDEO_MODEL,
            input=full_prompt,
        )
    except Exception as e:
        return {"error": f"Video generation failed: {str(e)}"}

    video_data = None
    mime_type = "video/mp4"

    if hasattr(interaction, "output_video") and interaction.output_video:
        video_data = getattr(interaction.output_video, "data", None)
        if getattr(interaction.output_video, "mime_type", None):
            mime_type = interaction.output_video.mime_type
    elif hasattr(interaction, "steps"):
        for step in getattr(interaction, "steps", []):
            for content in getattr(step, "content", []):
                if getattr(content, "type", None) == "video" or hasattr(content, "data"):
                    video_data = getattr(content, "data", None)
                    if getattr(content, "mime_type", None):
                        mime_type = content.mime_type
                    break
            if video_data:
                break

    if not video_data:
        return {"error": "No video data was returned by the Omni model."}

    if isinstance(video_data, str):
        video_bytes = base64.b64decode(video_data)
    elif isinstance(video_data, bytes):
        video_bytes = video_data
    else:
        return {"error": f"Unexpected video data format: {type(video_data)}"}

    slug = re.sub(r"[^a-z0-9]+", "_", item_name.lower()).strip("_")[:30]
    filename = f"{slug}_{uuid.uuid4().hex[:8]}.mp4"

    # 1. Save artifact with tool_context.save_artifact for Playground Artifacts panel
    if tool_context:
        try:
            artifact_part = types.Part.from_bytes(data=video_bytes, mime_type=mime_type)
            await tool_context.save_artifact(filename=filename, artifact=artifact_part)
        except Exception as e:
            print(f"Warning: Failed to save video artifact in tool_context: {e}")

    # 2. Upload video bytes directly to public Cloud Storage bucket (no local file)
    try:
        storage_cl = get_storage_client()
        bucket = storage_cl.bucket(BUCKET_NAME)
        blob = bucket.blob(f"videos/{filename}")
        blob.upload_from_string(video_bytes, content_type=mime_type)
        public_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{blob.name}"
    except Exception as e:
        return {"error": f"Failed to upload video to Cloud Storage: {str(e)}"}

    return {
        "status": "success",
        "item_name": item_name,
        "artifact_filename": filename,
        "public_video_url": public_url,
    }


def execute_python_in_sandbox(code: str) -> dict[str, Any]:
    """Execute Python code safely inside the Agent Engine sandbox and return the stdout output and results.

    Use this tool whenever performing calculations, portfolio valuations, returns, profit margins, or numerical analysis.

    Args:
        code: Python source code string to execute in the sandbox (e.g. "print(1250 * 1.15)").

    Returns:
        A dictionary containing the execution status, stdout, and any stderr messages.
    """
    try:
        from google.adk.code_executors.code_execution_utils import CodeExecutionInput

        result = sandbox_executor.execute_code(
            invocation_context=None,
            code_execution_input=CodeExecutionInput(code=code),
        )
        return {
            "status": "success" if not result.stderr else "warning",
            "stdout": result.stdout,
            "stderr": result.stderr,
        }
    except Exception as e:
        return {"error": f"Failed to execute code in sandbox: {str(e)}"}


def verify_and_inspect_collectible(image_url: str) -> dict[str, Any]:
    """Inspect a photo of an item (e.g. captured by camera or uploaded) and determine whether it is a collectible or not.

    Uses multimodal computer vision to examine physical indicators, grading slabs, authenticity markers,
    condition attributes, and model details to determine if the item belongs to a collectible category
    (trading cards, vintage watches, sneakers, retro video games, coins, comic books, vinyl records, memorabilia, antiques)
    or is an everyday non-collectible item.

    Args:
        image_url: Public HTTPS URL or Cloud Storage URL of the image to inspect.

    Returns:
        A dictionary with is_collectible (bool), category, confidence, identified_item, condition_indicators,
        verdict_explanation, and suggested_action.
    """
    try:
        resp = requests.get(image_url, timeout=15)
        resp.raise_for_status()
        image_bytes = resp.content
        mime_type = resp.headers.get("Content-Type", "image/jpeg").split(";")[0]
    except Exception as e:
        return {"error": f"Failed to fetch image from URL: {str(e)}"}

    try:
        genai_client = genai.Client(vertexai=True, project=PROJECT_ID, location="global")
        prompt = (
            "Examine this image carefully as an expert collectible authentication & appraisal specialist. "
            "Determine whether the object shown is a collectible (such as a rare sports/trading card, vintage luxury watch, "
            "collectible sneaker, retro video game, coin/bullion, comic book, vinyl record, sports memorabilia, or historical antique) "
            "or an everyday non-collectible item (such as an office supply, plain utensil, modern furniture, or general commodity).\n\n"
            "Return valid JSON with the following schema:\n"
            "{\n"
            '  "is_collectible": true | false,\n'
            '  "category": "Trading Card" | "Vintage Watch" | "Sneaker" | "Retro Game" | "Coin" | "Vinyl Record" | "Other Collectible" | "Not a Collectible",\n'
            '  "confidence": float between 0.0 and 1.0,\n'
            '  "identified_item": "Detailed name / model / edition / year if identifiable",\n'
            '  "condition_indicators": ["centering", "corners", "patina", "box condition", etc.],\n'
            '  "verdict_explanation": "Clear explanation of why this is or is not classified as a collectible, and notable visual attributes.",\n'
            '  "suggested_action": "Recommended next steps (e.g. estimate market value, check catalog comps, get professionally graded, or keep as personal souvenir)."\n'
            "}"
        )
        part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        response = genai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[part, prompt],
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        analysis = json.loads(response.text)
        analysis["status"] = "success"
        analysis["image_url"] = image_url
        return analysis
    except Exception as e:
        return {"error": f"Multimodal analysis failed: {str(e)}"}


root_agent = Agent(
    name="root_agent",
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    code_executor=sandbox_executor,
    instruction=(
        "You are a knowledgeable Collector & Marketplace Assistant. "
        "You help users browse, inspect, appraise, and manage rare collectibles "
        "(such as trading cards, sneakers, vintage watches, retro video games, and vinyl records). "
        "Use your tools to query the Firestore catalog, retrieve item details, list new items, "
        "update item status, appraise collectible market value, geocode addresses, find nearby stores or galleries, "
        "generate collectible showcase images, generate short collectible showcase videos using the Omni model, "
        "inspect user-provided photos or camera snapshots with verify_and_inspect_collectible to determine whether an item is a collectible, "
        "and run Python calculations in your Agent Engine sandbox. "
        "Whenever you generate an image or video using generate_collectible_image or generate_collectible_video, "
        "always embed the resulting media in your response using markdown syntax: "
        "![Item Name](public_image_url) or ![Item Name](public_video_url), "
        "so the media renders directly inside the chat interface."
    ),
    tools=[
        search_collectibles,
        get_collectible_details,
        add_collectible,
        update_collectible_status,
        estimate_market_value,
        geocode_address,
        find_nearby_places,
        generate_collectible_image,
        generate_collectible_video,
        verify_and_inspect_collectible,
        execute_python_in_sandbox,
    ],
)

app = App(
    root_agent=root_agent,
    name="app",
)
