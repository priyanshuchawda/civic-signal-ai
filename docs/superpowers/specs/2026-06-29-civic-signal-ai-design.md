# CivicSignal AI Design

## Product Positioning

CivicSignal AI is a Delhi-first decision intelligence platform for civic risk, service access, and public action planning. It helps residents and civic operators answer one practical question:

> Which Delhi areas are risky today, why, and what action should be taken next?

The product is not branded as an official Delhi government service. It is an independent civic intelligence tool that uses public, open, cached, and user-submitted data. The first city is Delhi, but the data model should stay portable enough to support other cities later.

## Constraints

- Use free or currently low-cost services during development.
- Do not use GitHub Actions until the final phase.
- Use Gemini API through environment variables supplied by the user.
- Do not depend on restricted live government APIs for the core user experience.
- Cache live public API responses before display.
- Avoid sending sensitive personal data to AI services.
- Design for real users, not a throwaway demo.

## Users

### Resident

Residents need a quick, plain-language answer about current local risk. They may ask about AQI, heat, rain, school exposure, hospital access, or a civic issue near them.

Core actions:

- View current city risk summary.
- Search/select a Delhi ward or locality.
- Ask natural-language questions.
- Submit a civic complaint with text and approximate location.
- Receive safety guidance and practical next steps.

### Civic Operator

Civic operators need a ranked view of which areas need attention and why. They need explainable action recommendations, not a black-box score.

Core actions:

- View top risk areas.
- Inspect risk factor breakdown.
- Review complaint classifications and urgency.
- See recommended actions by ward/locality.
- Export or copy daily action summaries.

## First Release Scope

The first release must be usable without paid infrastructure and without private government data. It will use a local data layer with seed datasets and cached API data.

Included:

- Delhi-first dashboard.
- Risk score model with AQI, heat/rain, complaint urgency, school exposure, hospital access, and transit access factors.
- Sample ward/locality dataset for initial development.
- Complaint intake form.
- Rule-based complaint classification fallback.
- Gemini-powered explanation endpoint when `GEMINI_API_KEY` is available.
- AI-safe input sanitizer before Gemini calls.
- Static action queue derived from the risk model.
- Clean documentation and one-issue-one-PR workflow.

Not included in first release:

- Authentication.
- GitHub Actions.
- Paid maps or paid Google Cloud services.
- Real-time bus vehicle positions.
- Direct integration with MCD 311, PGMS, or CPGRAMS.
- Production incident response workflows.

## Data Sources

### Core Free Sources

- Open-Meteo for weather, heat, rain, wind, and forecast data.
- data.gov.in CPCB AQI and CPCB bulletins for air quality.
- Open Transit Delhi static GTFS for bus and metro access.
- OpenStreetMap/Overpass for base maps and points of interest.
- Delhi Directorate of Education school lists.
- Delhi health facility sources and OSM/HDX health facility data.
- Delhi ward/population sources, including Census 2011 and public ward maps.
- User-submitted or seeded complaint data.

### Optional Later Sources

- Delhi Jal Board reports for water-quality RAG.
- National Water Data Portal for river discharge and flood context.
- OpenCity road crash data.
- RTO vehicle registration data.
- NITI energy dashboard.
- BigQuery public datasets if the project later needs large-scale analytics.

## Risk Model

The first model is deterministic and explainable:

```text
finalRiskScore =
  0.30 * aqiRisk
+ 0.20 * weatherRisk
+ 0.20 * complaintRisk
+ 0.10 * schoolExposureRisk
+ 0.10 * hospitalAccessRisk
+ 0.10 * transitAccessRisk
```

Each factor is normalized from `0` to `100`.

Risk levels:

- `low`: 0-24
- `moderate`: 25-49
- `high`: 50-74
- `very_high`: 75-100

The model must return a reason list, not only a score. Every recommendation should be traceable to one or more factors.

## AI Behavior

Gemini is used for explanations, civic guidance, and complaint triage. The application must still work without a Gemini key.

AI tasks:

- Explain why an area is high risk.
- Convert raw risk factors into resident-friendly advice.
- Convert operator context into daily action recommendations.
- Classify complaint text into civic category, urgency, and department.

Safety rules:

- Strip phone numbers, email addresses, and likely personal identifiers before sending text to Gemini.
- Do not send precise home addresses when an approximate locality is enough.
- Ask Gemini for structured JSON outputs where possible.
- Show deterministic fallback output if Gemini fails or the key is missing.
- Never present AI output as official government instruction.

## Architecture

### Application

Use Next.js with TypeScript as the main application. Keep Server Components as the default. Use client components only for interactive maps, filters, forms, and controls.

Main modules:

- `src/domain`: pure TypeScript domain logic for scores, complaints, sanitization, and recommendations.
- `src/data`: local seed data and read helpers.
- `src/ai`: Gemini client, prompts, parsing, and fallback behavior.
- `src/app`: App Router pages, layouts, server actions, and route handlers.
- `src/components`: reusable UI and feature components.

### Data Jobs

Use Python scripts for later ingestion work because civic data cleaning, CSV/GeoJSON handling, and geospatial preprocessing are stronger in Python. Do not add data jobs before the app foundation exists.

### Storage

Start with checked-in seed JSON for development. Move to SQLite/DuckDB when data volume or querying requires it. Use Supabase free tier only when a hosted database becomes necessary.

### Maps

Use Leaflet with OpenStreetMap tiles. Dynamic map components must be client-only and loaded carefully to avoid server rendering issues.

## Tech Stack

- Next.js + TypeScript
- React Server Components by default
- Tailwind CSS
- shadcn-style local UI primitives where useful
- Leaflet + OpenStreetMap
- Vitest for domain tests
- Playwright later for browser flows
- Gemini API through `@google/genai`
- Python later for data ingestion scripts

## GitHub Workflow

- `main` is the stable branch.
- Every change starts from a GitHub issue.
- One branch per issue.
- One pull request per issue.
- Merge PR into `main`.
- Delete merged branch.
- Use labels for type, priority, status, and area.
- Do not add GitHub Actions until the final phase.

Branch naming:

```text
issue-<number>-short-description
```

PR title format:

```text
<type>: <short user-facing outcome>
```

## Release Roadmap

### Release 0: Product Foundation

- Spec and implementation plan.
- Project scaffold.
- Design tokens and layout.
- Domain model for risk scoring.
- Seed data for Delhi localities.
- Basic dashboard using seed data.

### Release 1: First Usable Product

- Complaint intake.
- Complaint classification fallback.
- Gemini explanation endpoint.
- Resident and operator views.
- Action queue.
- Local persistence for submitted complaints.

### Release 2: Real Data Integrations

- Open-Meteo cached weather.
- AQI cached adapter.
- Static transit/school/hospital importers.
- Ward/locality data cleanup.
- Data freshness indicators.

### Release 3: Production Readiness

- Auth if needed.
- Hosted database.
- Deployment.
- GitHub Actions.
- End-to-end tests.
- Privacy and abuse hardening.

## Success Criteria

- A resident can identify risk in a Delhi area and understand why.
- A civic operator can see prioritized action areas.
- The system works without paid services.
- The system degrades gracefully without Gemini.
- The risk model is explainable.
- The project can be extended issue-by-issue without rewrites.
