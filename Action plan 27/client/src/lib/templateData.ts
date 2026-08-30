/** Operational Ledger design reminder: source lists are seeded from the attached AP27 Key sheet, never fabricated planning data. */
import type { ActivityType, Brand } from "./models";

const id = (prefix: string, value: string) => `${prefix}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export const DATA_HEADERS = [
  "Serial", "Brand", "Team", "Activity", "Description", "Country", "Specialty", "Date", "Location",
  "Number (Units / Customers)", "Cost / Item", "Total Cost", "Steps", "Responsibility", "Ownership",
  "Timeline", "Status", "Quarter", "P.Manager", "Payment Time Line",
] as const;

const activityNames = [
  "Group Meeting", "Group Presentation", "Offline Lecture", "Round Table Discussion", "HCP Sponsorship", "Medical Gift",
  "Brand Reminder", "Online lecture", "Public Awareness", "Design & Concept", "Printed Materials", "International Standalone Meeting",
  "Launch symposium", "Consultation", "Online subscription", "Enlisting fees", "CME Registration", "Local Conference Sponsorship",
  "Cycle Meeting", "Medical / Marketing Training", "Commercial Support", "Local Standalone Meeting", "International Conference Sponsorship",
  "Advisory Board", "Focus Group",
];

const brandNames = [
  "-", "Ambolar", "Amlodar - Amolar", "Amoxydar - Moxidad", "Amuretic", "Angiosar", "Angiosar - Plus", "Antiplex",
  "Anxetin", "Aphrodil", "Aresil", "Atrenova", "Azimac", "Azord - Xevaneer", "Broncholar", "Capocard",
  "Capocard Plus", "Carbatol", "Ceclor", "Cephadar", "Cibramine", "Cimedine", "Ciprodar - Qurex", "Claridar", "Clavodar",
];

export const initialActivityTypes: ActivityType[] = activityNames.map((name) => ({ id: id("activity", name), name }));
export const initialBrands: Brand[] = brandNames.map((name) => ({ id: id("brand", name), name }));

export const makeId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
export const now = () => new Date().toISOString();
export const quarterFor = (date: string) => date ? `Q${Math.floor(new Date(`${date}T12:00:00`).getMonth() / 3) + 1}` : "";
