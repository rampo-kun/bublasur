# Operating Model & Deployment Controls

## Intended users

Materials Management, Procurement, Finance, Production Planning, Logistics & Exports, Quality, HR and Sales can use the shared decision view to understand market exposure, model disruption scenarios and coordinate mitigation.

## Five connected workflows

1. **Market Intelligence:** review 3-, 6- and 12-month forecast outputs, compare forecast targets, and inspect model status, holdout metrics and uncertainty provenance.
2. **Scenario Planning:** select a named planning scenario or adjust individual material, freight, FX, demand and OEM pass-through assumptions. React state recalculates the financial chain immediately.
3. **Financial Impact:** review gross cost transmission, OEM recovery, retained cost, EBITDA, margin and simplified PAT. Division-level allocation is intentionally withheld until verified mapping data is available.
4. **Inventory & Containers:** adjust stock, consumption, lead time, safety stock, container payload, load, freight rate and FX to view cover, reorder threshold, payload utilisation and freight per tonne.
5. **Procurement Actions:** review ranked financial actions separately from qualitative actions, then coordinate affected functions and operational dependencies.

## Production integration requirements

The supplied application is an analytics and decision-support layer. Before operational rollout, Rane should provide:
- SSO / role-based access and audit logging.
- Approved ERP inventory, consumption, open purchase order and goods-in-transit feeds.
- Supplier master, supplier lead-time history, contract and quote data.
- Approved BOM and division / plant cost-centre mappings.
- Governed commodity / FX / freight update sources with timestamps and fallback policy.
- Approval workflow before recommendations become purchase or logistics instructions.

## Safe-use principles

- Forecasts are decision-support signals, not guaranteed market prices.
- Approximate uncertainty ranges must not be described as calibrated confidence intervals.
- Qualitative action scores are not comparable to financial priority scores.
- Illustrative inventory and BOM controls must not be interpreted as live stock or approved sourcing parameters.
- PAT is a simplified sensitivity bridge and not a full statutory forecast.
