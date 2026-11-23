# XOVATE ’26 — Rane (Madras) MMD Decision Engine

A Next.js dashboard built around the exported outputs in the supplied `outputs.zip`. It covers all five brief modules:
1. Price & freight forecasts
2. Scenario what-if simulator
3. Live financial recalculation
4. Container & inventory runway
5. Prescriptive procurement action matrix

## Run locally
1. Install Node.js 18.17+ (Node 20 LTS recommended).
2. Extract this ZIP.
3. In the project folder run:
   ```bash
   npm install
   npm run dev
   ```
4. Open http://localhost:3000

For a production build: `npm run build && npm start`.

## Data and provenance
- Source exports are included under `public/outputs/` exactly as received.
- The dashboard reads the exported CSV/JSON data; it does not refit forecasting models.
- Forecasts retain `Forecast_Status`, `Provenance`, interval methodology and calibration status.
- The scenario presets and BOM weights are illustrative/unverified where identified in the source outputs. Inventory and container defaults are illustrative.
- PAT change is a simplified bridge based on TX01; it does not model changes in D&A, interest, working capital or deferred tax.
- Forecast data quality notes are displayed, including the freight source's date-cadence issue and the irregular resin/annual rubber frequencies.
- Do not present illustrative inputs as verified Rane operational data.

## Architecture
- `app/page.tsx`: dashboard shell
- `components/DecisionDashboard.tsx`: five modules and interactive controls
- `app/api/dashboard/route.ts`: JSON API exposing dashboard data
- `public/outputs/`: original export bundle
- `lib/data.ts`: server-side CSV/JSON loading

## API
`GET /api/dashboard` returns baseline, reconciliation, forecasts, scenarios, supply-chain indicators, action matrices, assumption register, model metadata and metrics.

The original source files are preserved under `public/outputs`. This package is a frontend integration layer, not a replacement for the Python decision engine.
