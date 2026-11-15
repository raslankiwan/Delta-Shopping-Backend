import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { useT } from "../i18n/LocaleContext";

const NAV_ITEMS: Array<{ to: string; labelKey: string; icon: ReactNode }> = [
  {
    to: "/catalog",
    labelKey: "admin.nav.catalog",
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="6" height="6" rx="1.2" />
        <rect x="11" y="3" width="6" height="6" rx="1.2" />
        <rect x="3" y="11" width="6" height="6" rx="1.2" />
        <rect x="11" y="11" width="6" height="6" rx="1.2" />
      </svg>
    ),
  },
  {
    to: "/orders",
    labelKey: "admin.nav.orders",
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 5h12l-1 10.5a1 1 0 01-1 .9H6a1 1 0 01-1-.9L4 5z" />
        <path d="M7 5V4a3 3 0 016 0v1" />
      </svg>
    ),
  },
  {
    to: "/inventory",
    labelKey: "admin.nav.inventory",
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 6l7-3.5L17 6v8l-7 3.5L3 14V6z" />
        <path d="M3 6l7 3.5L17 6" />
        <path d="M10 9.5V17" />
      </svg>
    ),
  },
  {
    to: "/promotions",
    labelKey: "admin.nav.promotions",
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M10 3l1.7 3.6 3.9.4-2.9 2.7.8 3.9-3.5-2-3.5 2 .8-3.9-2.9-2.7 3.9-.4L10 3z" />
      </svg>
    ),
  },
  {
    to: "/reports",
    labelKey: "admin.nav.reports",
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 16V9M10 16V4M16 16v-6" />
      </svg>
    ),
  },
  {
    to: "/settings",
    labelKey: "admin.nav.settings",
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="10" cy="10" r="2.6" />
        <path d="M10 3.5v1.4M10 15.1v1.4M16.5 10h-1.4M4.9 10H3.5M14.6 5.4l-1 1M6.4 13.6l-1 1M14.6 14.6l-1-1M6.4 6.4l-1-1" />
      </svg>
    ),
  },
];

export function LeftNav() {
  const t = useT();

  return (
    <nav aria-label="Primary">
      <ul className="nav-list">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              {item.icon}
              {t(item.labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
