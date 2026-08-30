/** Operational Ledger design reminder: administrative setup stays compact and auditable, letting the ledger—not decoration—do the work. */
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import ExcelJS from "exceljs";
import { Check, FileUp, Pencil, Plus, ShieldCheck, Trash2, Upload, Users, X } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { Budget, UserRole } from "@/lib/models";
import { makeId, now } from "@/lib/templateData";

const clean = (value: unknown) => String(value ?? "").trim();
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");
const byName = <T extends { name: string }>(items: T[]) => [...items].sort((left, right) => left.name.localeCompare(right.name));

export default function AdminPage() {
  const {
    isAdmin, role, brands, countries, budgets, activityTypes, activities, members,
    saveBrand, saveCountry, saveBudget, saveActivityType, saveMember,
    removeBrand, removeActivityType, removeBudget, firebaseReady,
  } = useWorkspace();
  const [countryName, setCountryName] = useState("");
  const [currency, setCurrency] = useState("");
  const [brandName, setBrandName] = useState("");
  const [activityName, setActivityName] = useState("");
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editingActivityTypeId, setEditingActivityTypeId] = useState<string | null>(null);
  const [budgetCountry, setBudgetCountry] = useState("");
  const [budgetBrand, setBudgetBrand] = useState("");
  const [amount, setAmount] = useState("");
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const sortedBrands = useMemo(() => byName(brands), [brands]);
  const sortedActivityTypes = useMemo(() => byName(activityTypes), [activityTypes]);
  const sortedBudgets = useMemo(() => [...budgets].sort((left, right) => {
    const leftLabel = `${countries.find((item) => item.id === left.countryId)?.name ?? ""} ${brands.find((item) => item.id === left.brandId)?.name ?? ""}`;
    const rightLabel = `${countries.find((item) => item.id === right.countryId)?.name ?? ""} ${brands.find((item) => item.id === right.brandId)?.name ?? ""}`;
    return leftLabel.localeCompare(rightLabel);
  }), [brands, budgets, countries]);

  if (!isAdmin) return <div className="page admin-page"><section className="access-denied"><ShieldCheck size={30} /><p className="eyebrow">Administrator access</p><h1>This page is reserved for workspace administrators.</h1><p>Ask the workspace owner to assign you an administrator role if you need to maintain countries, brands, budgets, or users.</p></section></div>;

  const addCountry = async () => {
    const name = countryName.trim();
    if (!name) return;
    await saveCountry({ id: makeId("country"), name, currency: currency.trim().toUpperCase() || "USD", createdAt: now() });
    setCountryName(""); setCurrency("");
  };

  const submitBrand = async () => {
    const name = brandName.trim();
    if (!name) return;
    if (brands.some((brand) => brand.id !== editingBrandId && brand.name.toLowerCase() === name.toLowerCase())) {
      setNotice("This brand already exists."); return;
    }
    const existing = brands.find((brand) => brand.id === editingBrandId);
    await saveBrand({ id: existing?.id ?? makeId("brand"), name, createdAt: existing?.createdAt ?? now() });
    setBrandName(""); setEditingBrandId(null); setNotice(existing ? "Brand updated." : "Brand added.");
  };

  const submitActivityType = async () => {
    const name = activityName.trim();
    if (!name) return;
    if (activityTypes.some((item) => item.id !== editingActivityTypeId && item.name.toLowerCase() === name.toLowerCase())) {
      setNotice("This activity type already exists."); return;
    }
    const existing = activityTypes.find((item) => item.id === editingActivityTypeId);
    await saveActivityType({ id: existing?.id ?? makeId("activity-type"), name, createdAt: existing?.createdAt ?? now() });
    setActivityName(""); setEditingActivityTypeId(null); setNotice(existing ? "Activity type updated." : "Activity type added.");
  };

  const resetBudgetForm = () => { setBudgetCountry(""); setBudgetBrand(""); setAmount(""); setEditingBudgetId(null); };
  const upsertBudget = async (countryId: string, brandId: string, value: number, id?: string) => {
    const existing = budgets.find((budget) => budget.countryId === countryId && budget.brandId === brandId && budget.id !== id);
    if (existing && id) { setNotice("A budget already exists for this country and brand."); return false; }
    await saveBudget({ id: id ?? existing?.id ?? makeId("budget"), countryId, brandId, amount: value, updatedAt: now() });
    return true;
  };
  const submitBudget = async () => {
    const value = Number(amount);
    if (!budgetCountry || !budgetBrand || !Number.isFinite(value) || value < 0) { setNotice("Choose a country and brand, then enter a valid budget amount."); return; }
    if (await upsertBudget(budgetCountry, budgetBrand, value, editingBudgetId ?? undefined)) {
      setNotice(editingBudgetId ? "Budget updated." : "Budget saved."); resetBudgetForm();
    }
  };
  const editBudget = (budget: Budget) => { setEditingBudgetId(budget.id); setBudgetCountry(budget.countryId); setBudgetBrand(budget.brandId); setAmount(String(budget.amount)); setNotice("Editing selected budget."); };

  const importBudgetFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      let rows: unknown[][] = [];
      if (/\.xlsx?$/i.test(file.name)) { const workbook = new ExcelJS.Workbook(); await workbook.xlsx.load(await file.arrayBuffer()); const sheet = workbook.worksheets[0]; sheet.eachRow((row) => { if (Array.isArray(row.values)) rows.push(row.values.slice(1) as unknown[]); }); }
      else rows = (await file.text()).split(/\r?\n/).filter(Boolean).map((line) => line.split(",").map((part) => part.trim().replace(/^"|"$/g, "")));
      const header = rows.shift()?.map((value) => normalize(clean(value))) ?? [];
      const countryColumn = header.findIndex((value) => value === "country"); const brandColumn = header.findIndex((value) => value === "brand"); const budgetColumn = header.findIndex((value) => ["budget", "amount", "budgetamount"].includes(value));
      if (countryColumn < 0 || brandColumn < 0 || budgetColumn < 0) throw new Error("Use headers Country, Brand, and Budget (or Amount).");
      const knownCountries = [...countries]; const knownBrands = [...brands]; let saved = 0;
      for (const row of rows) {
        const countryValue = clean(row[countryColumn]); const brandValue = clean(row[brandColumn]); const budgetValue = Number(String(row[budgetColumn] ?? "").replace(/,/g, ""));
        if (!countryValue || !brandValue || Number.isNaN(budgetValue)) continue;
        let country = knownCountries.find((item) => item.name.toLowerCase() === countryValue.toLowerCase());
        if (!country) { country = { id: makeId("country"), name: countryValue, currency: "USD", createdAt: now() }; knownCountries.push(country); await saveCountry(country); }
        let brand = knownBrands.find((item) => item.name.toLowerCase() === brandValue.toLowerCase());
        if (!brand) { brand = { id: makeId("brand"), name: brandValue, createdAt: now() }; knownBrands.push(brand); await saveBrand(brand); }
        await upsertBudget(country.id, brand.id, budgetValue); saved += 1;
      }
      setNotice(`${saved} budget line${saved === 1 ? "" : "s"} imported. New countries or brands were added when needed.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "The budget file could not be imported."); }
    event.target.value = "";
  };

  return <div className="page admin-page">
    <section className="page-intro admin-intro"><div><p className="eyebrow">Workspace administration</p><h1>Set the rules <span>behind the plan.</span></h1><p className="page-lead">Maintain the country and brand choices used across the action plan, upload brand budgets, and keep team access appropriate.</p></div><img src="/action-plan-27/assets/budget-art.webp" alt="Abstract budget ledger artwork" /></section>
    {!firebaseReady && <div className="local-banner"><ShieldCheck size={18} /><span><b>Local preview mode.</b> Add Firebase configuration before GitHub Pages deployment to make this a shared multi-user workspace.</span></div>}
    {notice && <p className="admin-notice global-notice">{notice}</p>}
    <div className="admin-grid">
      <section className="panel admin-panel master-panel">
        <div className="panel-heading"><div><p className="eyebrow">Master data</p><h2>Countries, brands & activities</h2></div></div>
        <div className="admin-form-row"><label className="form-field"><span>New country</span><input value={countryName} onChange={(event) => setCountryName(event.target.value)} placeholder="e.g. Jordan" /></label><label className="form-field"><span>Currency</span><input value={currency} onChange={(event) => setCurrency(event.target.value)} placeholder="e.g. JOD" maxLength={3} /></label><button className="primary-button compact" onClick={addCountry}><Plus size={16} />Add</button></div>
        <div className="tag-register">{countries.length ? countries.map((country) => <span key={country.id}>{country.name}<b>{country.currency}</b></span>) : <small>No countries yet.</small>}</div>

        <div className="master-section"><div className="admin-form-row"><label className="form-field grow"><span>{editingBrandId ? "Edit brand" : "New brand"}</span><input value={brandName} onChange={(event) => setBrandName(event.target.value)} placeholder="Brand name" /></label><button className="primary-button compact" onClick={submitBrand}>{editingBrandId ? <Check size={16} /> : <Plus size={16} />}{editingBrandId ? "Update" : "Add brand"}</button>{editingBrandId && <button className="quiet-button compact square-action" onClick={() => { setEditingBrandId(null); setBrandName(""); }} aria-label="Cancel brand editing"><X size={16} /></button>}</div>
          <div className="master-register">{sortedBrands.map((brand) => { const inUse = budgets.some((item) => item.brandId === brand.id) || activities.some((item) => item.brandId === brand.id); return <div className="master-row" key={brand.id}><span>{brand.name}</span><div className="master-actions"><button className="icon-button" onClick={() => { setEditingBrandId(brand.id); setBrandName(brand.name); }} aria-label={`Edit ${brand.name}`}><Pencil size={14} /></button><DeleteControl label={brand.name} type="brand" disabled={inUse} disabledReason="This brand is used by a budget or action-plan row." onDelete={async () => { await removeBrand(brand.id); setNotice("Brand deleted."); }} /></div></div>; })}</div>
        </div>

        <div className="master-section"><div className="admin-form-row"><label className="form-field grow"><span>{editingActivityTypeId ? "Edit activity type" : "New activity type"}</span><input value={activityName} onChange={(event) => setActivityName(event.target.value)} placeholder="Activity type" /></label><button className="quiet-button compact" onClick={submitActivityType}>{editingActivityTypeId ? <Check size={16} /> : <Plus size={16} />}{editingActivityTypeId ? "Update" : "Add activity"}</button>{editingActivityTypeId && <button className="quiet-button compact square-action" onClick={() => { setEditingActivityTypeId(null); setActivityName(""); }} aria-label="Cancel activity type editing"><X size={16} /></button>}</div>
          <div className="master-register activity-register">{sortedActivityTypes.map((item) => { const inUse = activities.some((activity) => activity.activity === item.name); return <div className="master-row" key={item.id}><span>{item.name}</span><div className="master-actions"><button className="icon-button" onClick={() => { setEditingActivityTypeId(item.id); setActivityName(item.name); }} aria-label={`Edit ${item.name}`}><Pencil size={14} /></button><DeleteControl label={item.name} type="activity type" disabled={inUse} disabledReason="This activity type is used by an action-plan row." onDelete={async () => { await removeActivityType(item.id); setNotice("Activity type deleted."); }} /></div></div>; })}</div>
        </div>
      </section>

      <section className="panel admin-panel budget-panel"><div className="panel-heading"><div><p className="eyebrow">Budget ledger</p><h2>{editingBudgetId ? "Edit budget" : "Upload or set budget"}</h2></div><label className="file-button"><Upload size={16} />Import CSV / Excel<input type="file" accept=".csv,.xlsx,.xls" onChange={importBudgetFile} /></label></div><p className="panel-copy">For imports, use three columns named <b>Country</b>, <b>Brand</b>, and <b>Budget</b>. Existing country/brand budgets are updated rather than duplicated.</p>
        <div className="budget-form"><Select label="Country" value={budgetCountry} onChange={setBudgetCountry}><option value="">Select country</option>{countries.map((country) => <option value={country.id} key={country.id}>{country.name}</option>)}</Select><Select label="Brand" value={budgetBrand} onChange={setBudgetBrand}><option value="">Select brand</option>{sortedBrands.map((brand) => <option value={brand.id} key={brand.id}>{brand.name}</option>)}</Select><label className="form-field"><span>Budget amount</span><input type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" /></label><button className="primary-button" onClick={submitBudget}>{editingBudgetId ? "Update budget" : "Save budget"}</button>{editingBudgetId && <button className="quiet-button budget-cancel" onClick={resetBudgetForm}>Cancel</button>}</div>
        <div className="budget-register">{sortedBudgets.length ? sortedBudgets.map((budget) => <div className="budget-row" key={budget.id}><span>{countries.find((country) => country.id === budget.countryId)?.name} · {brands.find((brand) => brand.id === budget.brandId)?.name}</span><b>{budget.amount.toLocaleString()}</b><div className="master-actions"><button className="icon-button" onClick={() => editBudget(budget)} aria-label="Edit budget"><Pencil size={14} /></button><DeleteControl label={`${countries.find((country) => country.id === budget.countryId)?.name ?? ""} · ${brands.find((brand) => brand.id === budget.brandId)?.name ?? ""}`} type="budget" onDelete={async () => { await removeBudget(budget.id); if (editingBudgetId === budget.id) resetBudgetForm(); setNotice("Budget deleted."); }} /></div></div>) : <div className="empty-mini"><FileUp size={18} />No budgets uploaded yet.</div>}</div>
      </section>

      <section className="panel admin-panel members-panel"><div className="panel-heading"><div><p className="eyebrow">Team access</p><h2>Workspace members</h2></div><Users size={20} /></div><p className="panel-copy">The first person to sign in becomes the owner. Later sign-ins begin as editors. Only the workspace owner can change access roles.</p><div className="member-list">{members.length ? members.map((member) => <div className="member-row" key={member.id}><span className="avatar">{(member.displayName || member.email).slice(0, 1).toUpperCase()}</span><div><strong>{member.displayName || "Unnamed user"}</strong><small>{member.email}</small></div><select value={member.role} disabled={role !== "owner" || member.role === "owner"} onChange={(event) => void saveMember({ ...member, role: event.target.value as UserRole })}>{member.role === "owner" ? <option value="owner">Owner</option> : <><option value="admin">Admin</option><option value="editor">Editor</option><option value="viewer">Viewer</option></>}</select></div>) : <div className="empty-mini"><Users size={18} />Members appear after they sign in.</div>}</div></section>
    </div>
  </div>;
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return <label className="form-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{children}</select></label>;
}

function DeleteControl({ label, type, onDelete, disabled = false, disabledReason = "" }: { label: string; type: string; onDelete: () => Promise<void>; disabled?: boolean; disabledReason?: string }) {
  if (disabled) return <button className="icon-button destructive" disabled title={disabledReason} aria-label={`Cannot delete ${label}`}><Trash2 size={14} /></button>;
  return <AlertDialog><AlertDialogTrigger asChild><button className="icon-button destructive" aria-label={`Delete ${label}`}><Trash2 size={14} /></button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this {type}?</AlertDialogTitle><AlertDialogDescription>“{label}” will be permanently removed from the shared workspace.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="confirm-delete" onClick={() => void onDelete()}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
