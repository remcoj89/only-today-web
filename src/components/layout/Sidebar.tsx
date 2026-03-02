import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  CalendarCheck,
  LogOut,
  Settings,
  Target,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { getCurrentLocale, translateForLocale } from "@/i18n/runtime";
import { logout as logoutRequest } from "@/lib/auth";
import "./Sidebar.css";

type SidebarProps = {
  initialPath?: string;
};

type NavItem = {
  labelKey: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  badge?: string;
};

const navItems: NavItem[] = [
  { labelKey: "layout.home", href: "/today", icon: CalendarCheck },
  { labelKey: "layout.planning", href: "/planning", icon: Target },
  { labelKey: "layout.calendar", href: "/calendar", icon: Calendar },
  { labelKey: "layout.accountability", href: "/accountability", icon: Users, badge: "3" },
  { labelKey: "layout.analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar({ initialPath = "" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [pathname, setPathname] = useState(initialPath);
  const [locale, setLocale] = useState<ReturnType<typeof getCurrentLocale>>("nl");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setPathname(window.location.pathname);
    setLocale(getCurrentLocale());
  }, []);

  const t = useMemo(
    () => (key: string, values?: Record<string, string | number>) => translateForLocale(locale, key, values),
    [locale],
  );

  const isPlanningRoute = useMemo(
    () => pathname === "/planning" || pathname.startsWith("/planning/"),
    [pathname],
  );

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      <div className="sidebar__top">
        <a href="/today" className="sidebar__logo" aria-label={t("layout.homeAria")}>
          <span className="sidebar__logo-mark">OT</span>
          <span className="sidebar__logo-text">Only Today</span>
        </a>
        <button
          type="button"
          className="sidebar__collapse-toggle"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? t("layout.expandSidebar") : t("layout.collapseSidebar")}
          aria-pressed={collapsed}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="sidebar__nav" aria-label={t("layout.mainNavAria")}>
        {navItems.map((item) => {
          const isActive =
            item.href === "/planning"
              ? isPlanningRoute
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`sidebar__nav-item ${isActive ? "sidebar__nav-item--active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="sidebar__icon-wrap">
                <Icon size={24} strokeWidth={1.75} />
              </span>
              <span className="sidebar__label">{t(item.labelKey)}</span>
              {item.badge ? <span className="sidebar__badge">{item.badge}</span> : null}
            </a>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <a
          href="/settings"
          className={`sidebar__nav-item ${
            pathname === "/settings" ? "sidebar__nav-item--active" : ""
          }`}
          aria-current={pathname === "/settings" ? "page" : undefined}
        >
          <span className="sidebar__icon-wrap">
            <Settings size={24} strokeWidth={1.75} />
          </span>
          <span className="sidebar__label">{t("layout.settings")}</span>
        </a>
        <button
          type="button"
          className="sidebar__nav-item sidebar__logout-button"
          onClick={() => {
            if (isLoggingOut) {
              return;
            }
            setIsLoggingOut(true);
            void logoutRequest()
              .catch(() => undefined)
              .finally(() => {
                window.location.assign("/login");
              });
          }}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut || undefined}
        >
          <span className="sidebar__icon-wrap">
            <LogOut size={24} strokeWidth={1.75} />
          </span>
          <span className="sidebar__label">
            {isLoggingOut ? t("layout.loggingOut") : t("layout.logout")}
          </span>
        </button>
      </div>
    </aside>
  );
}
