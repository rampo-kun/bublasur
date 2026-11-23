
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public", "outputs");
function readText(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/^\uFEFF/, "");
}
export function readJson(rel: string) { return JSON.parse(readText(rel)); }

// Small CSV parser supporting quoted commas, escaped quotes and embedded newlines.
export function parseCsv(input: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i], n = input[i + 1];
    if (quoted) {
      if (c === '"' && n === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else {
      if (c === '"') quoted = true;
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c !== '\r') field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift() || [];
  return rows.filter(r => r.some(v => v !== "")).map(r =>
    Object.fromEntries(headers.map((h, i) => [h.trim(), (r[i] ?? "").trim()]))
  );
}
export function readCsv(rel: string) { return parseCsv(readText(rel)); }

export function getDashboardData() {
  const forecastFiles = ["copper","nickel","aluminium","hr_steel","cr_steel","resin","rubber","usd_inr","freight"];
  const forecasts: Record<string, any[]> = {};
  for (const name of forecastFiles) forecasts[name] = readCsv(`forecasts/${name}_forecast.csv`);
  return {
    baseline: readJson("analytics/financial_baseline.json"),
    scenarios: readJson("scenarios/scenario_baselines.json"),
    metadata: readJson("model_metrics/model_metadata.json"),
    forecasts,
    supplyChain: readCsv("analytics/supply_chain_indicators.csv"),
    financialActions: readCsv("scenarios/actions_financially_evaluable_red_sea.csv"),
    qualitativeActions: readCsv("scenarios/actions_qualitative_only_red_sea.csv"),
    assumptions: readCsv("assumptions/assumption_register.csv"),
    reconciliation: readCsv("analytics/financial_reconciliation.csv"),
    modelComparison: readCsv("model_metrics/model_comparison.csv"),
    splitAudit: readCsv("model_metrics/split_audit_log.csv"),
    dataCatalogue: readCsv("analytics/data_catalogue.csv"),
    dataDictionary: readCsv("analytics/data_dictionary.csv"),
    datasetUsage: readCsv("analytics/dataset_usage_map.csv"),
    transformationLog: readCsv("analytics/transformation_log.csv")
  };
}
