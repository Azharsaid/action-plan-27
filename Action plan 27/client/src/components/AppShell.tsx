/** Operational Ledger design reminder: the fixed rail and country ribbon keep planning context stable as users move through the workspace. */
import type { ReactNode } from "react";
import { BarChart3, ClipboardList, Download, LayoutDashboard, LogOut, Settings2, UsersRound } from "lucide-react";
import { useLocation } from "wouter";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { exportAP27Workbook } from "@/lib/exportWorkbook";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard }, { href: "/plan", label: "Action plan", icon: ClipboardList },
  { href: "/shared", label: "Shared activities", icon: UsersRound }, { href: "/admin", label: "Administration", icon: Settings2 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, brands, countries, activities, activityTypes, activeCountryId, setActiveCountryId, firebaseReady, signOutUser } = useWorkspace();
  const download = async () => { try { await exportAP27Workbook({ activities, brands, countries, activityTypes }); } catch (error) { window.alert(error instanceof Error ? error.message : "Export failed. Please try again."); } };
  return <div className="app-frame"><aside className="app-rail"><a className="brand-lockup" href="/" onClick={(event) => { event.preventDefault(); setLocation("/"); }}><img src="/manus-storage/action-plan-ledger-mark_105207f3.png" alt="Action Plan Planner mark" /><span>Action<br />Plan <small>Planner</small></span></a><nav>{navItems.map((item) => { const Icon = item.icon; const active = item.href === "/" ? location === "/" : location.startsWith(item.href); return <a className={active ? "nav-item active" : "nav-item"} key={item.href} href={item.href} onClick={(event) => { event.preventDefault(); setLocation(item.href); }}><Icon size={18} /><span>{item.label}</span></a>; })}</nav><div className="rail-bottom"><div className={firebaseReady ? "connection-state ready" : "connection-state local"}><i />{firebaseReady ? "Shared workspace" : "Local preview"}</div><button className="account-card" onClick={signOutUser} title="Sign out"><span className="avatar">{user?.displayName?.slice(0, 1).toUpperCase() ?? "A"}</span><span><strong>{user?.displayName ?? "Loading"}</strong><small>Sign out</small></span><LogOut size={15} /></button></div></aside><main className="workspace"><header className="topbar"><div className="country-ribbon"><span className="ribbon-label">Country</span>{countries.length ? countries.map((country) => <button key={country.id} className={country.id === activeCountryId ? "country-tab selected" : "country-tab"} onClick={() => setActiveCountryId(country.id)}>{country.name}</button>) : <span className="empty-ribbon">Add countries in Administration to begin.</span>}</div><button className="export-button" onClick={download}><Download size={17} />Download AP27</button></header>{children}</main><nav className="mobile-nav">{navItems.slice(0, 3).map((item) => { const Icon = item.icon; return <a href={item.href} key={item.href} className={location === item.href ? "active" : ""} onClick={(event) => { event.preventDefault(); setLocation(item.href); }}><Icon size={18} /><span>{item.label}</span></a>; })}</nav></div>;
}
