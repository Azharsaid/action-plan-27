/** Operational Ledger design reminder: this shared data layer treats every budget and allocation as a traceable ledger record. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, runTransaction, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import type { ActivityRecord, ActivityType, Brand, Budget, Country, Member, UserRole, WorkspaceData } from "@/lib/models";
import { initialActivityTypes, initialBrands, now } from "@/lib/templateData";

type Bucket = keyof WorkspaceData;
type WorkspaceContextValue = WorkspaceData & {
  user: User | { uid: string; email: string; displayName: string } | null;
  authLoading: boolean;
  activeCountryId: string;
  setActiveCountryId: (id: string) => void;
  firebaseReady: boolean;
  firebaseError: string | null;
  role: UserRole;
  isAdmin: boolean;
  canEdit: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  saveBrand: (item: Brand) => Promise<void>;
  saveActivityType: (item: ActivityType) => Promise<void>;
  saveCountry: (item: Country) => Promise<void>;
  saveBudget: (item: Budget) => Promise<void>;
  saveActivity: (item: ActivityRecord) => Promise<void>;
  saveMember: (item: Member) => Promise<void>;
  removeActivity: (id: string) => Promise<void>;
};

const LOCAL_KEY = "action-plan-planner-local-v1";
const defaultData: WorkspaceData = { brands: initialBrands, activityTypes: initialActivityTypes, countries: [], budgets: [], activities: [], members: [] };
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function readLocal(): WorkspaceData {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "null");
    return parsed ? { ...defaultData, ...parsed } : defaultData;
  } catch { return defaultData; }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WorkspaceData>(() => isFirebaseConfigured ? defaultData : readLocal());
  const [user, setUser] = useState<WorkspaceContextValue["user"]>(isFirebaseConfigured ? null : { uid: "local", email: "local-preview", displayName: "Local preview" });
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const [role, setRole] = useState<UserRole>(isFirebaseConfigured ? "viewer" : "owner");
  const [activeCountryId, setActiveCountryId] = useState("");
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const collectionRef = useCallback((bucket: Bucket) => {
    if (!db) throw new Error("Firebase is not configured.");
    return collection(db, "workspaces", "default", bucket);
  }, []);

  useEffect(() => {
    if (isFirebaseConfigured || typeof window === "undefined") return;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  }, [data]);

  const provisionMember = useCallback(async (current: User) => {
    const database = db;
    if (!database) return "viewer" as UserRole;
    const configRef = doc(database, "workspaces", "default");
    const memberRef = doc(database, "workspaces", "default", "members", current.uid);
    return runTransaction(database, async (transaction) => {
      const [configSnapshot, memberSnapshot] = await Promise.all([transaction.get(configRef), transaction.get(memberRef)]);
      if (!configSnapshot.exists()) {
        transaction.set(configRef, { ownerId: current.uid, createdAt: now() });
        transaction.set(memberRef, { email: current.email ?? "", displayName: current.displayName ?? "Workspace owner", role: "owner", joinedAt: now() });
        initialBrands.forEach((brand) => transaction.set(doc(collection(database, "workspaces", "default", "brands"), brand.id), brand));
        initialActivityTypes.forEach((activityType) => transaction.set(doc(collection(database, "workspaces", "default", "activityTypes"), activityType.id), activityType));
        return "owner" as UserRole;
      }
      if (!memberSnapshot.exists()) {
        transaction.set(memberRef, { email: current.email ?? "", displayName: current.displayName ?? "New user", role: "editor", joinedAt: now() });
        return "editor" as UserRole;
      }
      return (memberSnapshot.data().role ?? "viewer") as UserRole;
    });
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    return onAuthStateChanged(auth, async (current) => {
      setAuthLoading(false);
      setUser(current);
      if (!current) { setRole("viewer"); return; }
      try { setRole(await provisionMember(current)); }
      catch (error) { setFirebaseError(error instanceof Error ? error.message : "Could not initialize your shared workspace."); }
    });
  }, [provisionMember]);

  useEffect(() => {
    if (!isFirebaseConfigured || !db || !user || user.uid === "local") return;
    const buckets: Bucket[] = ["brands", "activityTypes", "countries", "budgets", "activities", "members"];
    const unsubscribers = buckets.map((bucket) => onSnapshot(collectionRef(bucket), (snapshot) => {
      const values = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setData((previous) => ({ ...previous, [bucket]: values } as WorkspaceData));
    }, (error) => setFirebaseError(error.message)));
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [collectionRef, user]);

  useEffect(() => {
    if (data.countries.some((country) => country.id === activeCountryId)) return;
    setActiveCountryId(data.countries[0]?.id ?? "");
  }, [activeCountryId, data.countries]);

  const save = useCallback(async (bucket: Bucket, item: { id: string }) => {
    setData((previous) => ({ ...previous, [bucket]: [...(previous[bucket] as { id: string }[]).filter((entry) => entry.id !== item.id), item] } as WorkspaceData));
    if (isFirebaseConfigured && db) await setDoc(doc(collectionRef(bucket), item.id), item);
  }, [collectionRef]);

  const removeActivity = useCallback(async (id: string) => {
    setData((previous) => ({ ...previous, activities: previous.activities.filter((activity) => activity.id !== id) }));
    if (isFirebaseConfigured && db) await deleteDoc(doc(collectionRef("activities"), id));
  }, [collectionRef]);

  const signIn = useCallback(async () => {
    if (!auth) return;
    setFirebaseError(null);
    await signInWithPopup(auth, new GoogleAuthProvider());
  }, []);
  const signOutUser = useCallback(async () => { if (auth) await signOut(auth); }, []);

  const value = useMemo<WorkspaceContextValue>(() => ({
    ...data, user, authLoading, activeCountryId, setActiveCountryId, firebaseReady: isFirebaseConfigured, firebaseError, role,
    isAdmin: role === "owner" || role === "admin", canEdit: role !== "viewer",
    signIn, signOutUser,
    saveBrand: (item) => save("brands", item), saveActivityType: (item) => save("activityTypes", item), saveCountry: (item) => save("countries", item),
    saveBudget: (item) => save("budgets", item), saveActivity: (item) => save("activities", item), saveMember: (item) => save("members", item), removeActivity,
  }), [activeCountryId, authLoading, data, firebaseError, removeActivity, role, save, signIn, signOutUser, user]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return context;
}
