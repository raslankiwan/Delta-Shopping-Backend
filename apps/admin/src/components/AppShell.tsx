import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { LeftNav } from "./LeftNav";
import { useT } from "../i18n/LocaleContext";

export function AppShell() {
  const t = useT();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">M</span>
          {t("admin.appName")}
        </div>
        <LeftNav />
      </aside>
      <TopBar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
