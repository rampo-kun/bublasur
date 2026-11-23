# Rane (Madras) — Materials Management Decision Intelligence

An enterprise-style Next.js decision-support interface for the Rane (Madras) Materials Management Department. The application integrates the supplied Python decision-engine exports and covers all five modules in the hackathon brief:

1. Price and freight forecasts across copper, nickel, aluminium, HR steel, CR steel, phenolic resin, natural rubber, USD/INR and 40-ft container freight.
2. What-if scenario simulation with the five brief presets and independent shock controls.
3. Interactive financial recalculation for landed-cost exposure, EBITDA, margin and simplified PAT.
4. Container and inventory planning, including payload utilisation, freight per tonne, inventory cover, reorder points and stock-out alerts.
5. Prescriptive action matrix with financially evaluable and qualitative-only recommendations, financial before/after values, dependencies and affected functions.

## Run locally

1. Use Node.js 18.17+ (Node 20 LTS recommended).
2. In the project directory run:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:3000

For a production build:
```bash
npm run build
npm start
```

## Data integrity and limitations

- Source exports are included under `public/outputs/`; their contents are preserved.
- The dashboard reads exported CSV/JSON outputs. It does not refit forecasting models at runtime.
- Forecasts retain model status, provenance, interval methodology, calibration status and source-specific quality warnings.
- The forecast visualisation supports line, bar and tabular views across the available horizons.
- Scenario presets, BOM weights, inventory and container defaults are illustrative where marked in the source exports. They are not verified Rane ERP or procurement values.
- PAT is a simplified sensitivity bridge; it does not model changes in D&A, interest, working capital or deferred tax.
- Supplier-level identifiers are not present in the supplied action exports; supplier-specific assignment requires a verified supplier master.
- The resin series is short and irregular, natural rubber is annual, and the freight source has a date-cadence issue. Treat these outputs with the warnings shown in the interface.
- Financial baseline reconciliation is surfaced in the audit module; the case brief and supplied workbook reporting scopes differ.

## Architecture

- `app/page.tsx` — server-rendered dashboard entry
- `components/DecisionDashboard.tsx` — navigation, five modules, scenario controls and visualisations
- `app/api/dashboard/route.ts` — JSON API for dashboard data
- `public/outputs/` — original exported outputs and model artefacts
- `lib/data.ts` — server-side CSV/JSON loading

This is a decision-support prototype, not a live ERP integration or a substitute for verified procurement, finance or supplier data.
