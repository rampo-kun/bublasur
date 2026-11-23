"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, ClipboardList, Factory, ShieldAlert, SlidersHorizontal, Truck } from "lucide-react";

type Props = {
  data: any;
  scenario: string;
  calc: any;
  shockMap: Record<string, number>;
  freightShock: number;
  fxShock: number;
  demandPct: number;
  passPct: number;
  inventory: number;
  reorder: number;
  inv: any;
};

const functions = ["Materials Management Department (MMD)", "Finance", "Production", "HR", "Quality", "Logistics and Exports", "Sales"];
const money = (v: number | null) => v === null || !Number.isFinite(v) ? "N/A" : `₹${v.toFixed(2)} Cr`;
const n = (v: any, d = 1) => Number(v || 0).toFixed(d);
const clamp = (v: number) => Math.max(0, Math.min(10, v));

const actionPlaybook: Record<string, any> = {
  AC01: { category: "Commercial recovery", owner: "Sales + Finance", period: "0–90 days", approvals: "Commercial leadership; OEM contract authority", steps: ["Map indexed material and freight clauses", "Prepare scenario-linked recovery case", "Negotiate at renewal / approved change window", "Track realised recovery against eligible cost base"], metric: "Incremental OEM recovery rate", frequency: "Monthly", dependencies: "OEM contract renewal windows", risk: "OEM rejects or delays pass-through; 60–90 day recovery lag", reconsider: "Reconsider if eligible cost shock is immaterial or OEM contract cannot be reopened." },
  AC02: { category: "Logistics optimisation", owner: "Logistics & Exports", period: "0–60 days", approvals: "Logistics head; plant loading / safety sign-off", steps: ["Validate actual payload and material compatibility", "Synchronise purchase orders and shipment windows", "Pilot consolidated loads", "Confirm damage, detention and service outcomes"], metric: "Average payload utilisation", frequency: "Per shipment / monthly", dependencies: "Shipment scheduling sync & container limits", risk: "Consolidation may increase dwell time or inventory delay", reconsider: "Reconsider if payload limits, material segregation or delivery windows prevent consolidation." },
  AC03: { category: "Treasury risk", owner: "Treasury + Finance", period: "0–30 days", approvals: "Treasury policy owner; delegated hedge authority", steps: ["Validate USD payable schedule", "Confirm hedge eligibility and counterparty limits", "Obtain competitive forward quotes", "Hedge only approved exposure and monitor mark-to-market"], metric: "Hedged eligible USD exposure", frequency: "Weekly", dependencies: "Treasury policy & bank credit lines", risk: "Forward carry and opportunity cost if INR appreciates", reconsider: "Reconsider if FX shock turns negative, exposure timing changes or forward carry exceeds avoided risk." },
  AC04: { category: "Inventory resilience", owner: "MMD + Production", period: "0–45 days", approvals: "Working-capital authority; warehouse and quality approval", steps: ["Confirm copper/aluminium consumption and open POs", "Check days cover and storage capacity", "Model 15/30/45-day buffer against price risk", "Release staged buys with quality inspection"], metric: "Days of approved critical-metal buffer", frequency: "Weekly", dependencies: "Warehouse space & working capital headroom", risk: "Working capital, price reversal, storage and obsolescence", reconsider: "Reconsider if inventory cover exceeds lead-time protection or price shock reverses." },
  AC05: { category: "Supply continuity", owner: "MMD + Quality", period: "6–12 months", approvals: "Quality / PPAP; OEM sign-off; sourcing committee", steps: ["Identify resin and speciality-steel specifications", "Issue RFQ to qualified candidate vendors", "Complete audits, trials and PPAP", "Approve controlled dual-source ramp-up"], metric: "Materials with approved alternate source", frequency: "Monthly gate review", dependencies: "PPAP qualification (6–12m) & OEM sign-off", risk: "Qualification failure, quality drift and unpriced vendor premium", reconsider: "Reconsider if vendor quotes, PPAP cost or qualification evidence remain unavailable." },
  AC06: { category: "Route resilience", owner: "Logistics & Exports", period: "0–90 days", approvals: "Logistics leadership; procurement / finance approval", steps: ["Map critical port lanes and cargo classes", "Request carrier and port-pair contingency quotes", "Validate inland drayage and transit-time options", "Run a tabletop disruption exercise"], metric: "Critical lanes with validated alternate route", frequency: "Quarterly and on disruption alert", dependencies: "Carrier slot agreements & inland drayage contracts", risk: "Alternate route may carry unpriced surcharge or longer inland transit", reconsider: "Reconsider after route quotes and service-level evidence are obtained." }
};

function buildActions(props: Props) {
  const { calc, data, shockMap, freightShock, fxShock, demandPct, passPct, inventory, reorder, inv } = props;
  const baseline = data.baseline.baseline;
  const demandFactor = 1 + demandPct / 100;
  const grossShock = Math.max(0, calc.gross);
  const freightSpend = baseline.annual_inbound_ocean_freight_cr * demandFactor * (1 + freightShock / 100);
  const usdSpend = 550.89 * demandFactor;
  const cuAlShock = Math.max(0, ((Number(shockMap.copper || 0) * .10 + Number(shockMap.aluminium || 0) * .20) / .30) / 100);
  const cuAlAnnual = baseline.raw_material_spend_cr * .30;
  const buffer = cuAlAnnual * (30 / 365);
  const financial = [
    { id:"AC01", title:"OEM Indexation Pass-Through Renegotiation (50% → 60%)", cost:.5, benefit:grossShock*Math.min(.10,Math.max(0,1-passPct/100)), feasibility:5, continuity:8, urgency:Math.min(10, 5 + grossShock / 10), confidence:7, affected:"Sales, Finance, Materials Mgmt, Production", deps:"OEM contract renewal windows", limitation:"60–90d OEM recovery lag not discounted", formula:`Incremental recovery is capped at 10 percentage points and at remaining unrecovered shock (current OEM pass-through ${passPct}%); ₹0.50 Cr implementation cost (AC01).` },
    { id:"AC02", title:"Inbound Container Freight Consolidation (80% → 92% payload)", cost:.4, benefit:freightSpend * Math.max(0, 1 - (inv.load/Math.max(inv.payload,1))/.92), feasibility:9, continuity:7, urgency:Math.min(10, 5 + Math.max(0, freightShock)/25), confidence:5, affected:"Logistics & Exports, Materials Mgmt, Production, Finance", deps:"Shipment scheduling sync & container limits", limitation:"Baseline 80% load (IV01) is illustrative", formula:`Scenario freight spend × (1 − current payload utilisation ÷ 92%) less ₹0.40 Cr cost; current load ${inv.load}t / ${inv.payload}t is an illustrative user input (IV01).` },
    { id:"AC03", title:"FX Forward Hedging (50% of USD-Exposed Spend)", cost:usdSpend*.5*.02, benefit:usdSpend*.5*Math.max(0,fxShock/100), feasibility:9, continuity:7, urgency:Math.min(10, 5 + Math.max(0,fxShock)/2), confidence:6, affected:"Finance, Materials Mgmt, Sales, Logistics & Exports", deps:"Treasury policy & bank credit lines", limitation:"2% forward carry illustrative; forgoes INR appreciation", formula:"50% × USD-exposed spend × positive FX shock; 2% forward carry on hedged notional." },
    { id:"AC04", title:"Advance Metal Procurement (30-Day Copper & Aluminium Buffer)", cost:buffer*.12*(30/365), benefit:buffer*cuAlShock, feasibility:7, continuity:9, urgency:Math.min(10, 5 + Math.max(0,cuAlShock*100)/3 + (inventory < inv.lead ? 2 : inventory < reorder/Math.max(inv.dailyUse,1) ? 1 : 0)), confidence:4, affected:"Materials Mgmt, Finance, Production, Quality", deps:"Warehouse space & working capital headroom", limitation:"12% p.a. carrying cost; BM01 material weights and IV02 inventory are illustrative", formula:"30-day copper/aluminium spend × weighted positive commodity shock less 30-day carrying cost at 12% p.a." }
  ].map(a => ({...a, category:actionPlaybook[a.id].category, net:a.benefit-a.cost, financial:true}));
  const qualitative = (data.qualitativeActions || []).map((a: any) => ({
    id: a.Financial_Status === "UNAVAILABLE_MISSING_VENDOR_QUOTES" ? "AC05" : "AC06",
    title: a.Action, cost:null, benefit:null, net:null, feasibility:Number(a.Implementation_Feasibility_10 ?? (a.Financial_Status.includes("VENDOR") ? 4 : 7)),
    continuity:Number(a.Supply_Continuity_10 || 0), urgency:Number(a.Operational_Urgency_10 || 0), confidence:Number(a.Data_Confidence_10 || 0),
    affected:a.Affected_Functions, deps:a.Operational_Dependencies, limitation:a.Limitations,
    category:actionPlaybook[a.Financial_Status.includes("VENDOR") ? "AC05" : "AC06"].category, financial:false,
    formula:"Financial effect unavailable in source exports; no monetary value or financial score is imputed."
  }));
  const all = [...financial, ...qualitative];
  const maxPositive = Math.max(1, ...financial.map(a => Math.max(0,a.net)));
  return all.map(a => {
    const financialScore = a.financial ? clamp(Math.max(0,a.net) / maxPositive * 10) : null;
    const dimensions = {
      financial: financialScore ?? 0,
      urgency: a.urgency,
      continuity: a.continuity,
      feasibility: a.feasibility,
      riskReduction: a.continuity * .65 + a.feasibility * .35,
      confidence: a.confidence
    };
    const score = a.financial
      ? dimensions.financial*.35 + dimensions.urgency*.15 + dimensions.continuity*.15 + dimensions.feasibility*.15 + dimensions.riskReduction*.10 + dimensions.confidence*.10
      : dimensions.urgency*.20 + dimensions.continuity*.30 + dimensions.feasibility*.20 + dimensions.riskReduction*.15 + dimensions.confidence*.15;
    const reasons = a.financial
      ? [`Net scenario benefit ${money(a.net)} (formula estimate)`, `Supply continuity ${a.continuity}/10`, `Execution feasibility ${a.feasibility}/10`]
      : [`Supply continuity ${a.continuity}/10`, `Urgency ${a.urgency}/10`, `Financial validation unavailable`];
    return {...a, dimensions, score, reasons, inventoryCover:inventory, reorder, inv};
  }).sort((a,b)=>b.score-a.score);
}

export default function ProcurementDecisionCentre(props: Props) {
  const actions = useMemo(() => buildActions(props), [props]);
  const [weights,setWeights] = useState({ financial:35, urgency:15, continuity:15, feasibility:15, risk:10, confidence:10 });
  const [statuses,setStatuses] = useState<Record<string,string>>({});
  const [filterPriority,setFilterPriority] = useState("All");
  const [filterCategory,setFilterCategory] = useState("All");
  const [filterStatus,setFilterStatus] = useState("All");
  const [filterOwner,setFilterOwner] = useState("All");
  const [filterBenefit,setFilterBenefit] = useState("All");
  const [view,setView] = useState("table");
  const [selected,setSelected] = useState("AC02");
  const [supplierFile,setSupplierFile] = useState("");
  const [compare,setCompare] = useState<string[]>(["AC02","AC03"]);
  const [showWeights,setShowWeights] = useState(false);
  const weighted = useMemo(() => actions.map(a => {
    const d=a.dimensions;
    const financialTotal = weights.financial + weights.urgency + weights.continuity + weights.feasibility + weights.risk + weights.confidence;
    const qualitativeTotal = weights.urgency + weights.continuity + weights.feasibility + weights.risk + weights.confidence;
    const score = a.financial
      ? (d.financial*weights.financial+d.urgency*weights.urgency+d.continuity*weights.continuity+d.feasibility*weights.feasibility+d.riskReduction*weights.risk+d.confidence*weights.confidence)/Math.max(1,financialTotal)
      : (d.urgency*weights.urgency+d.continuity*weights.continuity+d.feasibility*weights.feasibility+d.riskReduction*weights.risk+d.confidence*weights.confidence)/Math.max(1,qualitativeTotal);
    return {...a,score};
  }).sort((a,b)=>b.score-a.score),[actions,weights]);
  const selectedAction = weighted.find(a=>a.id===selected) || weighted[0];
  const filtered = weighted.filter(a =>
    (filterPriority==="All" || (filterPriority==="High" ? a.score>=7 : filterPriority==="Medium" ? a.score>=5 && a.score<7 : a.score<5)) &&
    (filterCategory==="All" || a.category===filterCategory) &&
    (filterStatus==="All" || (statuses[a.id] || "Proposed")===filterStatus) &&
    (filterOwner==="All" || actionPlaybook[a.id].owner===filterOwner) &&
    (filterBenefit==="All" || (filterBenefit==="Positive" && a.financial && a.net>0) || (filterBenefit==="Non-positive" && a.financial && a.net<=0) || (filterBenefit==="N/A" && !a.financial))
  );
  const setStatus=(id:string,status:string)=>setStatuses(s=>({...s,[id]:status}));
  const impactFor=(a:any,fn:string) => {
    const key=fn.toLowerCase();
    const map:Record<string,any> = {
      "materials management department (mmd)": ["Positive","High","Owns sourcing strategy, supplier engagement and material exposure controls.","Validate demand, quotations and sourcing gates."],
      "finance": [a.financial && a.net!==null && a.net>0 ? "Positive" : a.financial ? "Watch" : "Watch","High",a.id==="AC03"?"Hedge carry, credit limits and exposure accounting must be approved.":a.id==="AC02"?"Validate landed freight savings and working-capital effects.":"Validate business case, funding and benefit realisation.","Approve cost envelope and track realised value."],
      "production": [a.id==="AC04"||a.id==="AC05"?"Watch":"Neutral",a.id==="AC04"||a.id==="AC05"?"High":"Medium",a.id==="AC04"?"Buffer availability may protect continuity but must align to consumption and storage.":a.id==="AC02"?"Consolidated shipments require schedule alignment.":"Protect material availability while procurement changes are executed.","Confirm production plan and material call-offs."],
      "hr": [a.id==="AC05"?"Watch":"Neutral","Low",a.id==="AC05"?"Supplier qualification and alternate sourcing may require audit / technical capacity.":"No direct workforce change is evidenced in the supplied action dataset.","Confirm capacity only if workload changes."],
      "quality": [a.id==="AC05"||a.id==="AC04"?"Watch":"Neutral","High",a.id==="AC05"?"Alternate resin / speciality steel requires audit, trials and PPAP before release.":a.id==="AC04"?"Incoming inspection capacity and material shelf / storage controls need review.":"Maintain existing inspection and material release controls.","Approve specifications, trials and inspection plan."],
      "logistics and exports": [a.id==="AC02"||a.id==="AC06"?"Positive":"Watch","High",a.id==="AC02"?"Payload consolidation can reduce freight per tonne if shipment cadence and payload limits hold.":a.id==="AC06"?"Route contingency depends on carrier slots and inland drayage contracts.":"Coordinate shipment windows and transport exposure.","Validate lane, payload and carrier constraints."],
      "sales": [a.id==="AC01"?"Positive":a.id==="AC05"?"Watch":"Neutral","Medium",a.id==="AC01"?"OEM indexation negotiation can recover eligible input-cost shocks; contract timing is a constraint.":"Customer delivery commitments and price / supply communication may be affected.","Align customer commitments and commercial approvals."]
    };
    const v=map[key] || ["Neutral","Low","No direct effect is evidenced.","Monitor during execution."];
    return {classification:v[0],severity:v[1],explanation:v[2],required:v[3],dependencies:actionPlaybook[a.id].deps,responsible:actionPlaybook[a.id].owner};
  };
  const impactRows = selectedAction ? functions.map(fn=>({fn,...impactFor(selectedAction,fn)})) : [];
  const portfolio = weighted.filter(a=>a.financial && a.net>0).sort((a,b)=>b.net-a.net).slice(0,3);

  const barData=weighted.map(a=>({name:a.id,benefit:a.financial?a.benefit:0,cost:a.financial?a.cost:0}));
  const priorityCounts=["High","Medium","Low"].map(level=>({level,count:weighted.filter(a=>level==="High"?a.score>=7:level==="Medium"?a.score>=5&&a.score<7:a.score<5).length}));
  const exposure=[
    {material:"Copper + Aluminium",exposure:"30% of raw-material spend",basis:"BM01 illustrative mix",actions:"AC04 advance buffer"},
    {material:"Resin + speciality steel",exposure:"Material categories only",basis:"Supplier quotes / master absent",actions:"AC05 dual-source qualification"},
    {material:"Inbound freight lanes",exposure:"₹25 Cr annual baseline freight",basis:"Case baseline; carrier-level data absent",actions:"AC02 consolidation; AC06 route contingency"}
  ];
  const stages=["Proposed","Under Review","Approved","In Progress","Completed"];
  return <section id="procurement" className="section procurement-centre">
    <div className="section-heading"><div className="section-icon"><ClipboardList size={19}/></div><div><h2>Procurement Decision Centre</h2><p>Scenario-responsive recommendations, financial evidence, cross-functional impacts and execution governance. Execution states are user-maintained and do not imply approval.</p></div></div>
    <div className="pdc-banner"><div><b>Active scenario · {props.scenario.replaceAll("_"," ")}</b><span>Current retained cost impact {money(props.calc.retained)} · Inventory cover {n(props.inventory)} days · Reorder point {n(props.reorder,0)} t</span></div><span className="pdc-source">Notebook action formulas + live scenario inputs</span></div>
    <div className="pdc-kpis">
      <div><small>Ranked actions</small><strong>{weighted.length}</strong><span>4 financial · 2 qualitative</span></div>
      <div><small>Top financial net benefit</small><strong>{money(Math.max(0,...weighted.filter(a=>a.financial).map(a=>a.net)))}</strong><span>Current scenario estimate</span></div>
      <div><small>Qualitative actions</small><strong>{weighted.filter(a=>!a.financial).length}</strong><span>Financial value remains N/A</span></div>
      <div><small>Supplier master</small><strong>Not connected</strong><span>Material exposure interim view</span></div>
    </div>
    <div className="pdc-toolbar">
      <label>Priority<select value={filterPriority} onChange={e=>setFilterPriority(e.target.value)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></label>
      <label>Category<select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}><option>All</option>{Array.from(new Set(weighted.map(a=>a.category))).map(v=><option key={v}>{v}</option>)}</select></label>
      <label>Status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option>All</option>{stages.map(v=><option key={v}>{v}</option>)}</select></label>
      <label>Responsible department<select value={filterOwner} onChange={e=>setFilterOwner(e.target.value)}><option>All</option>{Array.from(new Set(weighted.map(a=>actionPlaybook[a.id].owner))).map(v=><option key={v}>{v}</option>)}</select></label><label>Financial benefit<select value={filterBenefit} onChange={e=>setFilterBenefit(e.target.value)}><option>All</option><option>Positive</option><option>Non-positive</option><option>N/A</option></select></label>
      <button className="pdc-secondary" onClick={()=>setShowWeights(v=>!v)}><SlidersHorizontal size={15}/> Ranking weights</button>
    </div>
    {showWeights && <div className="pdc-panel pdc-weight-panel"><div className="pdc-panel-head"><h3>Configurable ranking weights</h3><span>Defaults: financial 35%, urgency 15%, continuity 15%, feasibility 15%, risk 10%, confidence 10%</span></div>{Object.entries(weights).map(([k,v])=><label className="pdc-weight" key={k}><span>{k==="risk"?"Risk reduction":k[0].toUpperCase()+k.slice(1)} <b>{v}%</b></span><input type="range" min="0" max="60" value={v} onChange={e=>setWeights(w=>({...w,[k]:Number(e.target.value)}))}/></label>)}<button className="pdc-secondary" onClick={()=>setWeights({financial:35,urgency:15,continuity:15,feasibility:15,risk:10,confidence:10})}>Restore defaults</button><p className="pdc-muted">Weights are normalised at scoring time. Qualitative-only actions exclude the financial dimension and are not directly comparable to financial scores.</p></div>}
    <div className="pdc-panel">
      <div className="pdc-panel-head"><div><h3>Ranked recommendation register</h3><span>Scores recalculate from scenario shocks, current financial bridge, operational inputs and configurable weights.</span></div><div className="pdc-switch"><button className={view==="table"?"active":""} onClick={()=>setView("table")}>Table</button><button className={view==="chart"?"active":""} onClick={()=>setView("chart")}>Benefit / cost</button></div></div>
      {view==="chart" ? <div className="pdc-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={barData} margin={{top:10,right:20,left:0,bottom:5}}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis/><Tooltip formatter={(v:any)=>[money(Number(v)),"INR Cr"]}/><Bar dataKey="benefit" name="Financial benefit" fill="#167f78"/><Bar dataKey="cost" name="Implementation cost" fill="#c28b45"/></BarChart></ResponsiveContainer></div> :
      <div className="pdc-table-wrap"><table className="pdc-table"><thead><tr><th>Rank / action</th><th>Category</th><th>Priority score</th><th>Benefit</th><th>Cost</th><th>Net benefit</th><th>Feasibility</th><th>Continuity</th><th>Execution status</th></tr></thead><tbody>{filtered.map((a,i)=><tr key={a.id} className={selected===a.id?"selected":""}><td><button className="pdc-action-link" onClick={()=>setSelected(a.id)}><b>{String(i+1).padStart(2,"0")} · {a.id}</b><span>{a.title}</span></button></td><td>{a.category}</td><td><b>{n(a.score,2)}/10</b><small>{a.confidence}/10 confidence</small></td><td>{a.financial?money(a.benefit):"N/A"}</td><td>{a.financial?money(a.cost):"N/A"}</td><td>{a.financial?money(a.net):"N/A"}</td><td>{a.feasibility}/10</td><td>{a.continuity}/10</td><td><select value={statuses[a.id]||"Proposed"} onChange={e=>setStatus(a.id,e.target.value)}>{stages.map(v=><option key={v}>{v}</option>)}</select></td></tr>)}</tbody></table></div>}
      <p className="pdc-muted">Financial amounts are scenario-dependent formula estimates, not approved savings. Source CSV values are scenario reference outputs; live action estimates use the same notebook formula families with current inputs. Qualitative-only rows never receive monetary estimates.</p>
    </div>
    {selectedAction && <div className="pdc-detail-grid">
      <div className="pdc-panel"><div className="pdc-panel-head"><div><h3>{selectedAction.id} · Decision rationale</h3><span>{selectedAction.title}</span></div><strong className="pdc-score">{n(selectedAction.score,2)}/10</strong></div><ul className="pdc-reasons">{selectedAction.reasons.map((r:string)=><li key={r}>{r}</li>)}</ul><div className="pdc-component-scores">{Object.entries(selectedAction.dimensions).map(([k,v]:any)=><div key={k}><small>{k.replace(/[A-Z]/g," $&")}</small><b>{n(v,1)}/10</b></div>)}</div><div className="pdc-explain"><b>Calculation / evidence</b><p>{selectedAction.formula}</p><b>Dependencies</b><p>{selectedAction.deps}</p><b>Main risks</b><p>{actionPlaybook[selectedAction.id].risk}</p><b>Reconsider when</b><p>{actionPlaybook[selectedAction.id].reconsider}</p><b>Data status</b><p>{selectedAction.financial?"Formula-derived estimate; dependent on BM01 / IV01 where stated.":"Qualitative only; financial effect unavailable in source dataset."}</p></div></div>
      <div className="pdc-panel"><div className="pdc-panel-head"><h3>Before / after financial bridge</h3><span>INR Cr · current scenario vs selected action</span></div>{selectedAction.financial ? <div className="pdc-table-wrap"><table className="pdc-table pdc-fin-table"><thead><tr><th>Metric</th><th>Before action</th><th>After action</th><th>Difference</th></tr></thead><tbody>{[
        ["Landed material cost",props.data.baseline.baseline.raw_material_spend_cr+props.calc.materialGross,props.data.baseline.baseline.raw_material_spend_cr+props.calc.materialGross-(selectedAction.id==="AC04"?selectedAction.benefit:0)],
        ["Annual procurement cost",props.data.baseline.baseline.raw_material_spend_cr+props.data.baseline.baseline.annual_inbound_ocean_freight_cr+props.calc.gross,props.data.baseline.baseline.raw_material_spend_cr+props.data.baseline.baseline.annual_inbound_ocean_freight_cr+props.calc.gross-selectedAction.net],
        ["EBITDA",props.calc.ebitda,props.calc.ebitda+selectedAction.net],
        ["PAT",props.calc.pat,props.calc.pat+selectedAction.net*(1-props.data.baseline.baseline.effective_tax_rate)],
        ["Inventory carrying cost",selectedAction.id==="AC04"?0:null,selectedAction.id==="AC04"?selectedAction.cost:null],
        ["Freight cost",props.data.baseline.baseline.annual_inbound_ocean_freight_cr+props.calc.freightGross,props.data.baseline.baseline.annual_inbound_ocean_freight_cr+props.calc.freightGross-(selectedAction.id==="AC02"?selectedAction.benefit:0)],
        ["Net financial benefit",0,selectedAction.net]
      ].map((r:any,i)=><tr key={i}><td>{r[0]}</td><td>{money(r[1])}</td><td>{money(r[2])}</td><td>{r[1]===null||r[2]===null?"N/A":money(r[2]-r[1])}</td></tr>)}</tbody></table></div>:<div className="pdc-na"><ShieldAlert size={18}/> Financial comparison is N/A. Vendor quotes, PPAP cost or carrier contract / route surcharge data are not present in the supplied exports.</div>}<p className="pdc-muted">EBITDA/PAT bridge assumes action net benefit flows through operating earnings; PAT applies the existing TX01 simplified tax factor. Inventory carrying cost is only isolated for AC04. No unsupported allocation is presented as supplier-specific.</p></div>
    </div>}
    <div className="pdc-panel"><div className="pdc-panel-head"><div><h3>Seven-function ripple-effect matrix</h3><span>Action-specific operational explanation, severity and accountable function · selected: {selectedAction?.id}</span></div></div><div className="pdc-table-wrap"><table className="pdc-table"><thead><tr><th>Function</th><th>Impact</th><th>Severity</th><th>Explanation</th><th>Required action / owner</th></tr></thead><tbody>{impactRows.map(r=><tr key={r.fn}><td><b>{r.fn}</b></td><td><span className={`pdc-impact ${r.classification.toLowerCase()}`}>{r.classification}</span></td><td>{r.severity}</td><td>{r.explanation}</td><td>{r.required}<small>Owner: {r.responsible}</small><small>Dependency: {r.dependencies}</small></td></tr>)}</tbody></table></div></div>
    <div className="pdc-detail-grid">
      <div className="pdc-panel"><div className="pdc-panel-head"><h3>Material exposure interim view</h3><span><Factory size={15}/> Supplier data integration status</span></div><div className="pdc-warning"><ShieldAlert size={17}/> Supplier master records, supplier IDs, contractual terms, supplier-level spend and lead times are absent. No supplier names or supplier-specific metrics are inferred.</div><div className="pdc-table-wrap"><table className="pdc-table"><thead><tr><th>Material / lane</th><th>Exposure / basis</th><th>Data status</th><th>Related action</th></tr></thead><tbody>{exposure.map(r=><tr key={r.material}><td><b>{r.material}</b></td><td>{r.exposure}</td><td>{r.basis}</td><td>{r.actions}</td></tr>)}</tbody></table></div><label className="pdc-upload">Future supplier master integration (CSV)<input type="file" accept=".csv,text/csv" onChange={e=>setSupplierFile(e.target.files?.[0]?.name||"")}/></label>{supplierFile&&<small className="pdc-muted">Selected locally: {supplierFile}. Upload / persistence is not configured in this prototype.</small>}</div>
      <div className="pdc-panel"><div className="pdc-panel-head"><h3>Execution planner</h3><span><Truck size={15}/> {selectedAction?.id} workplan</span></div><div className="pdc-stage-timeline">{stages.map((stage,i)=><div key={stage} className={stages.indexOf(statuses[selectedAction.id]||"Proposed")>=i?"reached":""}><span>{i+1}</span><small>{stage}</small></div>)}</div><div className="pdc-execution-meta"><div><small>Suggested owner</small><b>{actionPlaybook[selectedAction.id].owner}</b></div><div><small>Implementation period</small><b>{actionPlaybook[selectedAction.id].period}</b></div><div><small>Required approvals</small><b>{actionPlaybook[selectedAction.id].approvals}</b></div><div><small>Success metric</small><b>{actionPlaybook[selectedAction.id].metric}</b></div><div><small>Monitoring frequency</small><b>{actionPlaybook[selectedAction.id].frequency}</b></div><div><small>Current execution stage</small><b>{statuses[selectedAction.id]||"Proposed"}</b></div></div><ol className="pdc-steps">{actionPlaybook[selectedAction.id].steps.map((s:string)=><li key={s}>{s}</li>)}</ol><p className="pdc-muted">Execution status is stored in this browser session only. It is separate from the calculated recommendation and does not represent actual approval or completion.</p></div>
    </div>
    <div className="pdc-detail-grid">
      <div className="pdc-panel"><div className="pdc-panel-head"><h3>Risk-adjusted priority distribution</h3><span>Normalised 0–10 dimensions</span></div><div className="pdc-chart short"><ResponsiveContainer width="100%" height="100%"><BarChart data={priorityCounts}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="level"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="count" fill="#34556e"/></BarChart></ResponsiveContainer></div><div className="pdc-explain"><b>Ranking logic</b><p>Financially evaluable actions combine normalised financial impact, urgency, continuity, feasibility, risk reduction and confidence. Defaults weight these 35/15/15/15/10/10. Qualitative-only actions exclude financial impact and use their own operational dimensions; the two classes are not directly comparable.</p></div></div>
      <div className="pdc-panel"><div className="pdc-panel-head"><h3>Action portfolio & what-if comparison</h3><span>Financially evaluable actions only</span></div><div className="pdc-portfolio">{portfolio.map(a=><label key={a.id}><input type="checkbox" checked={compare.includes(a.id)} onChange={e=>setCompare(c=>e.target.checked?[...c,a.id]:c.filter(x=>x!==a.id))}/><span>{a.id} · {a.title}</span><b>{money(a.net)}</b></label>)}</div><div className="pdc-portfolio-total"><small>Selected portfolio net estimate</small><b>{money(weighted.filter(a=>compare.includes(a.id)&&a.financial).reduce((sum,a)=>sum+a.net,0))}</b></div><p className="pdc-muted">Simple additive screening only; interactions, capacity constraints and double counting are not optimised. ERP actuals are required for savings leakage monitoring.</p></div>
    </div>
    <div className="pdc-panel pdc-footnote"><b>Calculation provenance & limitations</b><p>Scenario inputs are shared with Modules 1–4: commodity shocks, freight shock, FX shock, demand, OEM pass-through and inventory assumptions. Base values derive from the case baseline and notebook outputs. AC01–AC04 follow the notebook action formula families; AC05–AC06 remain qualitative because vendor quotes / PPAP costs and carrier contracts / route surcharges are missing. Material mix BM01 and inventory defaults IV01/IV02 are illustrative. No live external market data, supplier master or realised savings feed is connected.</p><p>Source files: actions_financially_evaluable_red_sea.csv, actions_qualitative_only_red_sea.csv, scenario_baselines.json, financial_baseline.json, assumption_register.csv and model_metadata.json. Forecast model uncertainty remains in the forecast module and is not converted to supplier confidence.</p></div>
  </section>;
}
