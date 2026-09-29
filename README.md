# Collector Assistant

An intelligent Collector & Marketplace Assistant built with Google ADK (Agent Development Kit), Gemini 3.6 Flash, and Agent Platform.

The assistant helps collectors, enthusiasts, and dealers browse rare collectibles (trading cards, sneakers, vintage watches, retro video games, vinyl records), appraise market values, locate physical hobby shops, generate studio showcase images, and run portfolio calculations in a secure sandbox.

## Features & Capabilities

- **Firestore Catalog Management**: Search, retrieve, add, and update collectible inventory stored in Google Cloud Firestore (`collectibles` collection).
- **Market Value Appraisal**: Estimates current market value using recent auction comps, rarity tiering, and standard condition multipliers (Mint, Near Mint, Good, Fair, Poor).
- **Store & Gallery Locator**: Uses Google Maps Geocoding and Places (New) APIs to find nearby hobby shops, comic stores, and vintage galleries for any location.
- **Showcase Image Generation**: Uses `gemini-3.1-flash-lite-image` (global region) to generate studio-grade showcase images, automatically uploaded to Google Cloud Storage with public URLs and registered in ADK session artifacts.
- **Agent Platform Code Sandbox**: Executes Python calculations (portfolio valuations, ROI, CAGR, profit margins) inside an isolated Vertex AI Agent Engine Sandbox (`AgentEngineSandboxCodeExecutor`).

## Project Structure

```
collector-assistant/
├── app/
│   ├── agent.py               # Main agent definition, tools, and sandbox executor
│   ├── fast_api_app.py        # FastAPI Backend server
│   └── app_utils/             # Helpers and logging
├── seed_firestore.py          # Script to populate initial Firestore items
├── agents-cli-manifest.yaml   # Agent deployment manifest
├── pyproject.toml             # Python dependencies and project metadata
└── project_brief.md           # Project specification and domain brief
```

## Setup & Local Development

### 1. Prerequisites
- Python 3.10+
- `uv` package manager (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
- `google-agents-cli` (`uv tool install google-agents-cli`)
- Google Cloud SDK (`gcloud`) authenticated with project access

### 2. Install Dependencies
```bash
agents-cli install
```

### 3. Environment Variables
Create a `.env` file based on `.env.example`:
```bash
GOOGLE_MAPS_API_KEY="<your-maps-api-key>"
```

### 4. Run the Agent Locally
Test conversations directly from the terminal:
```bash
agents-cli run "Find vintage Pokemon cards in the catalog under $500"
```

Launch the interactive web playground:
```bash
agents-cli playground
```
| `agents-cli publish gemini-enterprise` | Register deployed agent to Gemini Enterprise                    || [A2A Inspector](https://github.com/a2aproject/a2a-inspector) | Launch A2A Protocol Inspector                                                        |

## 🛠️ Project Management

| Command | What It Does |
|---------|--------------|
| `agents-cli scaffold enhance` | Add CI/CD pipelines and Terraform infrastructure |
| `agents-cli infra cicd` | One-command setup of entire CI/CD pipeline + infrastructure |
| `agents-cli scaffold upgrade` | Auto-upgrade to latest version while preserving customizations |

---

## Development

Edit your agent logic in `app/agent.py` and test with `agents-cli playground` - it auto-reloads on save.

## Deployment

```bash
gcloud config set project <your-project-id>
agents-cli deploy
```

To add CI/CD and Terraform, run `agents-cli scaffold enhance`.
To set up your production infrastructure, run `agents-cli infra cicd`.

## Observability

Built-in telemetry exports to Cloud Trace, BigQuery, and Cloud Logging.

## A2A Inspector

This agent supports the [A2A Protocol](https://a2a-protocol.org/). Use the [A2A Inspector](https://github.com/a2aproject/a2a-inspector) to test interoperability.
See the [A2A Inspector docs](https://github.com/a2aproject/a2a-inspector) for details.
