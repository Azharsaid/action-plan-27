/** Operational Ledger design reminder: export intentionally preserves the AP27 Data and Key sheet structure for spreadsheet continuity. */
import ExcelJS from "exceljs";
import type { ActivityRecord, ActivityType, Brand, Country } from "./models";

const TEMPLATE_URL = import.meta.env.VITE_AP27_TEMPLATE_URL || "/manus-storage/AP27_deaf34b6.xlsx";

const valueFor = (items: { id: string; name: string }[], itemId: string) => items.find((item) => item.id === itemId)?.name ?? "";
const dateValue = (value: string) => value ? new Date(`${value}T12:00:00`) : "";

export async function exportAP27Workbook({
  activities, brands, countries, activityTypes,
}: {
  activities: ActivityRecord[];
  brands: Brand[];
  countries: Country[];
  activityTypes: ActivityType[];
}) {
  const response = await fetch(TEMPLATE_URL);
  if (!response.ok) throw new Error("The AP27 export template could not be loaded.");

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await response.arrayBuffer());
  const data = workbook.getWorksheet("Data");
  const key = workbook.getWorksheet("Key");
  if (!data || !key) throw new Error("The AP27 template is missing its Data or Key sheet.");

  const ordered = [...activities].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999") || a.createdAt.localeCompare(b.createdAt));
  const finalRow = Math.max(175, ordered.length + 2);

  for (let row = 3; row <= finalRow; row += 1) {
    for (let col = 1; col <= 20; col += 1) {
      const target = data.getCell(row, col);
      if (row > 175) target.style = data.getCell(3, col).style;
      target.value = null;
    }
  }

  ordered.forEach((record, index) => {
    const row = index + 3;
    const sharedNote = record.source === "shared" ? ` [Shared allocation: ${record.sharedWeight}%]` : "";
    const values = [
      index + 1,
      valueFor(brands, record.brandId), record.team, record.activity,
      `${record.description ?? ""}${sharedNote}`.trim(), valueFor(countries, record.countryId), record.specialty,
      dateValue(record.date), record.location, record.numberOfUnits, record.costPerItem, record.totalCost,
      record.steps, record.responsibility, record.ownership, record.timeline, record.status, record.quarter,
      record.productManager, record.paymentTimeline,
    ];
    values.forEach((value, column) => { data.getCell(row, column + 1).value = value as ExcelJS.CellValue; });
  });

  data.autoFilter = { from: "A2", to: `T${finalRow}` };
  data.getCell("L1").value = { formula: `SUBTOTAL(9,L3:L${finalRow})`, result: ordered.reduce((sum, item) => sum + item.totalCost, 0) };

  const keyRows = Math.max(76, brands.length + 1, activityTypes.length + 1);
  for (let row = 2; row <= keyRows; row += 1) {
    if (row > 26) {
      key.getCell(row, 1).style = key.getCell(2, 1).style;
      key.getCell(row, 3).style = key.getCell(2, 3).style;
    }
    key.getCell(row, 1).value = activityTypes[row - 2]?.name ?? null;
    key.getCell(row, 2).value = null;
    key.getCell(row, 3).value = brands[row - 2]?.name ?? null;
  }

  for (let row = 3; row <= finalRow; row += 1) {
    data.getCell(row, 2).dataValidation = { type: "list", allowBlank: true, formulae: [`Key!$C$2:$C$${Math.max(2, brands.length + 1)}`] };
    data.getCell(row, 4).dataValidation = { type: "list", allowBlank: true, formulae: [`Key!$A$2:$A$${Math.max(2, activityTypes.length + 1)}`] };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "AP27_Action_Plan.xlsx";
  anchor.click();
  URL.revokeObjectURL(url);
}
