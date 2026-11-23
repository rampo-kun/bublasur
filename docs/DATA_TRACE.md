# Data Trace & Model Provenance

## Source-to-module lineage

| Source family | Notebook processing / exported artefact | Application destination | Data status |
|---|---|---|---|
| Copper and nickel price histories | Cleaned monthly series; `forecasts/copper_forecast.csv`, `forecasts/nickel_forecast.csv` | Market Intelligence; Scenario Planning | Observed history and modelled forecasts |
| Aluminium price workbook | Multi-block source sheet unpivoted to monthly LME cash series; aluminium forecast export | Market Intelligence; Scenario Planning | Observed history and modelled forecasts |
| Steel price workbook | HR and CR coil series; `hr_steel_forecast.csv`, `cr_steel_forecast.csv` | Market Intelligence; Scenario Planning | Observed history and modelled forecasts |
| Resin source | 17 irregular observations; resin forecast export carries not-recommended status | Market Intelligence | Observed but insufficient for reliable monthly forecast |
| Natural rubber source | Annual observations; annual-only forecast export | Market Intelligence | Observed annual series |
| Forex source | Daily RBI reference / interbank close values aggregated to USD/INR forecast export | Market Intelligence; Scenario Planning | Observed history and modelled forecast |
| Container freight source | Sequential observations; freight forecast export and cadence warning | Market Intelligence; Scenario Planning; Inventory & Containers | Experimental |
| Port activity and GSCPI | `analytics/supply_chain_indicators.csv` | Executive Overview | Derived risk indicators |
| Financial workbooks and planning baseline | `financial_baseline.json`, `financial_reconciliation.csv` | Executive Overview; Financial Impact | Modelled baseline plus reconciliation |
| Assumptions and transformations | `assumption_register.csv`, `transformation_log.csv` | Scenario Planning; Financial Impact; Governance & Data Trace | Traceable assumptions and derived steps |
| Procurement action model | Financial and qualitative action CSV exports | Procurement Actions | Formula-evaluable and qualitative evidence kept separate |

## Provenance labels

- **OBSERVED** — present in the supplied source datasets.
- **DERIVED** — computed from observed values; transformation details are retained in the transformation log.
- **MODELLED** — forecast or scenario output produced by the Python pipeline.
- **CASE / PLANNING BASELINE** — standardised FY25 modelled planning values used for comparability.
- **STATUTORY TAX** — tax assumption used by the simplified PAT sensitivity.
- **MISSING-DATA / ILLUSTRATIVE** — placeholder operational inputs where verified Rane ERP or procurement data was not supplied.

## Forecast validation and uncertainty

The notebook uses a temporal train pool, expanding-window validation contained within that pool, and an untouched final holdout used only after model selection. The split audit records the non-overlap check. Forecast exports preserve model choice, validation/holdout metrics, target horizon and quality status.

Parametric model prediction intervals use `Model_PI_95_Lower` / `Model_PI_95_Upper` and are labelled `PARAMETRIC_MODEL_BASED`. Approximate empirical ranges use `Approx_Range_Lower` / `Approx_Range_Upper` and are labelled `APPROXIMATE_UNCALIBRATED_RANGE`. These fields are not interchangeable.

## Automated quality checks recorded by the notebook

The source notebook reports 11 quality-control categories:

1. Unit conversion checks for resin and rubber.
2. Date ordering checks.
3. Duplicate-date checks.
4. Missing-data handling and explicit unavailable states.
5. Forecast leakage prevention and temporal split isolation.
6. Forecast horizon, status and honest interval-label checks.
7. Scenario recalculation checks.
8. Financial calculation and pass-through sensitivity checks.
9. Procurement financial / qualitative action separation.
10. Inventory calculation and invalid-input rejection.
11. Assumption-ID traceability across scenarios and actions.

The notebook's final cell reports that all 11 categories passed for that notebook run. This statement describes the supplied notebook execution; it is not a claim that the Next.js application has independently rerun the Python test suite.

## Known data gaps

- No verified division-level BOM / cost-centre mapping.
- No verified inventory on-hand, open PO, in-transit, quality-hold or consumption feed.
- No approved container actual-weight or supplier lead-time feed.
- No supplier master identifiers in the procurement action exports.
- Resin frequency is irregular and sparse; natural rubber is annual; freight source cadence is imperfect.

These gaps are surfaced rather than silently filled. Replace illustrative inputs with approved operational data before using outputs for purchase orders or production commitments.
