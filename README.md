# Rane (Madras) Materials Intelligence Platform

Enterprise decision-support workspace for Materials Management, Finance, Production, Logistics, Quality, HR and Sales. The application brings market forecasts, disruption planning, financial sensitivity, inventory runway and procurement actions into one operating view.

## Run the application

Requirements: Node.js 18.17+ (Node 20 LTS recommended).

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The dashboard is server-rendered from the curated model exports and exposes the same dataset through `GET /api/dashboard`.

Production verification:

```bash
npm run lint
npm run build
npm start
```

## Decision modules

1. **Market intelligence** — Copper, nickel, aluminium, HR steel, CR steel, phenolic resin, natural rubber, USD/INR and 40-ft freight forecasts. Forecast horizons, model selection, holdout metrics, uncertainty labels and data-quality warnings are retained.
2. **Scenario planning** — Base case, Red Sea/Hormuz crisis, metal shock, tariff/FX escalation and demand recession, with independent commodity, freight, FX, demand and OEM pass-through controls.
3. **Financial impact chain** — Immediate recalculation of gross shock, OEM recovery, retained cost, EBITDA, margin and simplified PAT.
4. **Inventory & containers** — Inventory cover, reorder point, safety stock, payload utilisation and freight per tonne.
5. **Procurement actions** — Financially evaluable and qualitative-only action recommendations, cost/benefit/net impact where supported, dependencies and affected functions.

## Calculation reference

The interactive scenario engine uses the exported FY25 modelled baseline and explicitly labelled illustrative parameters.

- Commodity shock = annual raw-material spend × illustrative material share × demand factor × commodity shock percentage.
- Freight shock = annual inbound ocean-freight spend × demand factor × freight shock percentage.
- FX shock = exported USD-exposed spend proxy × demand factor × FX shock percentage.
- Gross shock = commodity shock + freight shock + FX shock.
- OEM recovery = gross shock × OEM pass-through percentage.
- Retained cost = gross shock − OEM recovery.
- Scenario EBITDA = baseline EBITDA − retained cost.
- Scenario revenue = baseline revenue × demand factor.
- Scenario EBITDA margin = scenario EBITDA ÷ scenario revenue × 100.
- Simplified scenario PAT = baseline PAT − retained cost × (1 − effective tax rate).

The PAT bridge is deliberately simplified. It does not model D&A, interest, working capital or deferred tax. Division-level cost allocation is not presented because verified division BOM and cost-centre mappings were not included in the supplied files.

## Data integrity and operating boundaries

- The original exported CSV/JSON artefacts are retained under `public/outputs/`.
- The application reads the exported model artefacts; it does not refit models in the web runtime.
- Model-based parametric prediction intervals and approximate uncalibrated ranges are displayed as different interval types.
- Resin has only 17 irregular observations; monthly forecasting is not recommended.
- Natural rubber is annual-frequency data; its forecast is labelled annual-only.
- Freight has a source date-cadence issue and is labelled experimental.
- Illustrative BOM weights, inventory, container payload, lead-time and stock defaults are not verified ERP values.
- Supplier names/IDs are absent from the action exports. Supplier-specific execution requires an approved supplier master.
- Financial baseline reconciliation is surfaced in the Governance & Data Trace module.

## Quality and governance

The source notebook records 11 automated quality-control categories covering unit conversions, date ordering, duplicate dates, missing-data handling, leakage-free temporal splits, forecast horizons and interval labelling, scenario recalculation, financial calculations, procurement action separation, inventory/input validation and assumption traceability. The exported split audit, model comparison, assumption register, transformation log and data catalogue are available in the application.

See `docs/DATA_TRACE.md` for source-to-module lineage and `docs/OPERATING_MODEL.md` for operating boundaries and deployment controls.

## Architecture

- `app/page.tsx` — application entry
- `components/DecisionDashboard.tsx` — enterprise workspace and five decision modules
- `app/api/dashboard/route.ts` — dashboard data API
- `lib/data.ts` — server-side CSV/JSON readers
- `public/outputs/` — curated model outputs and trained model artefacts
- `docs/` — data lineage and operating model documentation

This application is a decision-support layer. It is not connected to Rane's ERP, supplier portals, live commodity feeds or logistics execution systems in the supplied implementation. Connect approved enterprise sources and access controls before production operational deployment.
