/** Operational Ledger design reminder: data models preserve the AP27 workbook’s familiar spreadsheet vocabulary. */
export type UserRole = "owner" | "admin" | "editor" | "viewer";

export type Brand = { id: string; name: string; createdAt?: string };
export type ActivityType = { id: string; name: string; createdAt?: string };
export type Country = { id: string; name: string; currency: string; createdAt?: string };
export type Budget = { id: string; countryId: string; brandId: string; amount: number; updatedAt?: string };
export type Member = { id: string; email: string; displayName: string; role: UserRole; joinedAt?: string };

export type ActivityRecord = {
  id: string;
  brandId: string;
  team: string;
  activity: string;
  description: string;
  countryId: string;
  specialty: string;
  date: string;
  location: string;
  numberOfUnits: number;
  costPerItem: number;
  totalCost: number;
  steps: string;
  responsibility: string;
  ownership: string;
  timeline: string;
  status: string;
  quarter: string;
  productManager: string;
  paymentTimeline: string;
  source: "direct" | "shared";
  sharedGroupId?: string;
  sharedWeight?: number;
  createdAt: string;
  updatedAt: string;
};

export type ActivityDraft = Omit<ActivityRecord, "id" | "totalCost" | "source" | "createdAt" | "updatedAt">;

export type WorkspaceData = {
  brands: Brand[];
  activityTypes: ActivityType[];
  countries: Country[];
  budgets: Budget[];
  activities: ActivityRecord[];
  members: Member[];
};
