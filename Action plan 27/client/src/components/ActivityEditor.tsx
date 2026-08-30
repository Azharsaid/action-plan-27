/** Operational Ledger design reminder: the entry editor preserves AP27’s 20-column logic while making allocation math visible before save. */
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type { ActivityDraft, ActivityRecord, Brand } from "@/lib/models";
import { makeId, now, quarterFor } from "@/lib/templateData";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const emptyDraft = (countryId = ""): ActivityDraft => ({ brandId: "", team: "", activity: "", description: "", countryId, specialty: "", date: "", location: "", numberOfUnits: 1, costPerItem: 0, steps: "", responsibility: "", ownership: "", timeline: "", status: "Planned", quarter: "", productManager: "", paymentTimeline: "" });
type FieldKey = keyof ActivityDraft;
const textFields: { key: FieldKey; label: string; span?: boolean; type?: "text" | "date" | "number" }[] = [
  { key: "team", label: "Team" }, { key: "specialty", label: "Specialty" }, { key: "date", label: "Date", type: "date" }, { key: "location", label: "Location" },
  { key: "numberOfUnits", label: "Number (Units / Customers)", type: "number" }, { key: "costPerItem", label: "Cost / Item", type: "number" },
  { key: "steps", label: "Steps", span: true }, { key: "responsibility", label: "Responsibility" }, { key: "ownership", label: "Ownership" },
  { key: "timeline", label: "Timeline" }, { key: "productManager", label: "P.Manager" }, { key: "paymentTimeline", label: "Payment Time Line" },
];

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="form-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{children}</select></label>;
}

function CommonFields({ draft, setDraft, includeBrand }: { draft: ActivityDraft; setDraft: (next: ActivityDraft) => void; includeBrand: boolean }) {
  const { brands, countries, activityTypes } = useWorkspace();
  const set = (key: FieldKey, value: string | number) => {
    const next = { ...draft, [key]: value } as ActivityDraft;
    if (key === "date" && !next.quarter) next.quarter = quarterFor(String(value));
    setDraft(next);
  };
  return <div className="entry-grid">
    {includeBrand && <SelectField label="Brand" value={draft.brandId} onChange={(value) => set("brandId", value)}><option value="">Select brand</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</SelectField>}
    <SelectField label="Activity" value={draft.activity} onChange={(value) => set("activity", value)}><option value="">Select activity type</option>{activityTypes.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</SelectField>
    <SelectField label="Country" value={draft.countryId} onChange={(value) => set("countryId", value)}><option value="">Select country</option>{countries.map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}</SelectField>
    <label className="form-field field-span"><span>Description</span><textarea value={draft.description} onChange={(event) => set("description", event.target.value)} placeholder="Scope, customer segment, key objectives or allocation note" /></label>
    {textFields.map((field) => <label key={field.key} className={`form-field ${field.span ? "field-span" : ""}`}><span>{field.label}</span><input type={field.type ?? "text"} min={field.type === "number" ? 0 : undefined} step={field.type === "number" ? "0.01" : undefined} value={draft[field.key] as string | number} onChange={(event) => set(field.key, field.type === "number" ? Number(event.target.value) : event.target.value)} /></label>)}
    <SelectField label="Status" value={draft.status} onChange={(value) => set("status", value)}><option>Planned</option><option>In progress</option><option>Completed</option><option>On hold</option><option>Cancelled</option></SelectField>
    <SelectField label="Quarter" value={draft.quarter} onChange={(value) => set("quarter", value)}><option value="">Not set</option><option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option></SelectField>
  </div>;
}

export function DirectActivityDialog({ record, onClose }: { record?: ActivityRecord; onClose: () => void }) {
  const { activeCountryId, saveActivity, canEdit } = useWorkspace();
  const [draft, setDraft] = useState<ActivityDraft>(() => record ? { ...record } : emptyDraft(activeCountryId));
  const [error, setError] = useState("");
  const total = Number(draft.numberOfUnits || 0) * Number(draft.costPerItem || 0);
  useEffect(() => { if (!record) setDraft((current) => ({ ...current, countryId: current.countryId || activeCountryId })); }, [activeCountryId, record]);

  const submit = async () => {
    if (!draft.brandId || !draft.activity || !draft.countryId) { setError("Brand, activity, and country are required."); return; }
    await saveActivity({ ...draft, id: record?.id ?? makeId("activity"), totalCost: total, source: "direct", createdAt: record?.createdAt ?? now(), updatedAt: now() });
    onClose();
  };
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Action plan entry"><section className="entry-dialog"><header className="dialog-header"><div><p className="eyebrow">{record ? "Edit row" : "New row"}</p><h2>{record ? "Refine this action-plan line" : "Add an action-plan line"}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close editor"><X size={20} /></button></header><div className="dialog-scroll"><CommonFields draft={draft} setDraft={setDraft} includeBrand /><div className="total-preview"><span>Calculated Total Cost</span><strong>{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong><small>Number × Cost / Item</small></div>{error && <p className="form-error">{error}</p>}</div><footer className="dialog-footer"><button className="quiet-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={!canEdit} onClick={submit}>Save to action plan</button></footer></section></div>;
}

type Allocation = { brandId: string; weight: number };
export function SharedActivityEditor() {
  const { activeCountryId, brands, saveActivity, canEdit } = useWorkspace();
  const [draft, setDraft] = useState<ActivityDraft>(() => emptyDraft(activeCountryId));
  const [allocations, setAllocations] = useState<Allocation[]>([{ brandId: "", weight: 100 }]);
  const [error, setError] = useState("");
  const total = Number(draft.numberOfUnits || 0) * Number(draft.costPerItem || 0);
  const weightTotal = useMemo(() => allocations.reduce((sum, allocation) => sum + Number(allocation.weight || 0), 0), [allocations]);
  useEffect(() => { setDraft((current) => ({ ...current, countryId: current.countryId || activeCountryId })); }, [activeCountryId]);
  const changeAllocation = (index: number, key: keyof Allocation, value: string | number) => setAllocations((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  const submit = async () => {
    if (!draft.activity || !draft.countryId) { setError("Activity and country are required."); return; }
    if (allocations.length < 2 || allocations.some((item) => !item.brandId || item.weight <= 0) || Math.abs(weightTotal - 100) > 0.001) { setError("Add at least two brands and ensure the combined weight is exactly 100%."); return; }
    const group = makeId("shared");
    await Promise.all(allocations.map((allocation) => saveActivity({ ...draft, id: makeId("activity"), brandId: allocation.brandId, costPerItem: Number(draft.costPerItem || 0) * allocation.weight / 100, totalCost: total * allocation.weight / 100, description: `${draft.description || ""}`.trim(), source: "shared", sharedGroupId: group, sharedWeight: allocation.weight, createdAt: now(), updatedAt: now() })));
    setDraft(emptyDraft(activeCountryId)); setAllocations([{ brandId: "", weight: 100 }]); setError("");
  };
  return <section className="shared-editor"><div className="section-heading"><div><p className="eyebrow">Shared activity</p><h2>Enter the common activity once</h2><p>The system writes a linked action-plan row for every brand and charges each budget by its approved weight.</p></div><div className="allocation-total"><span>Allocation total</span><strong className={Math.abs(weightTotal - 100) < 0.001 ? "good" : "danger"}>{weightTotal.toFixed(0)}%</strong></div></div><CommonFields draft={draft} setDraft={setDraft} includeBrand={false} /><div className="shared-allocation-list"><div className="list-caption"><span>Brand allocations</span><small>Each weight is applied to the calculated activity total of {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}.</small></div>{allocations.map((allocation, index) => <div className="allocation-row" key={index}><label className="form-field"><span>Brand</span><select value={allocation.brandId} onChange={(event) => changeAllocation(index, "brandId", event.target.value)}><option value="">Select brand</option>{brands.map((brand: Brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label><label className="form-field"><span>Weight</span><div className="percent-input"><input type="number" min="0" max="100" value={allocation.weight} onChange={(event) => changeAllocation(index, "weight", Number(event.target.value))} /><span>%</span></div></label><div className="allocation-cost">{(total * allocation.weight / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div><button className="icon-button subtle" disabled={allocations.length === 1} onClick={() => setAllocations((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove allocation"><Trash2 size={17} /></button></div>)}<button className="add-line-button" onClick={() => setAllocations((current) => [...current, { brandId: "", weight: 0 }])}><Plus size={16} /> Add another brand</button></div>{error && <p className="form-error">{error}</p>}<div className="shared-submit"><div><span>Full activity cost</span><strong>{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div><button className="primary-button" disabled={!canEdit} onClick={submit}>Create allocated plan rows</button></div></section>;
}
