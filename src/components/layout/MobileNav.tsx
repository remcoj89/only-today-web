import { useEffect, useMemo, useState } from "react";
import { BarChart3, Calendar, CalendarCheck, Settings, Target } from "lucide-react";
import { defaultLocale } from "@/i18n/config";
import { getCurrentLocale, translateForLocale } from "@/i18n/runtime";
import "./MobileNav.css";

type MobileNavProps = {
  initialPath?: string;
};

type TabItem = {
  labelKey: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  badge?: string;
};

const tabs: TabItem[] = [
  { labelKey: "layout.home", href: "/today", icon: CalendarCheck },
  { labelKey: "layout.planning", href: "/planning", icon: Target },
  { labelKey: "layout.calendar", href: "/calendar", icon: Calendar, badge: "2" },
  { labelKey: "layout.analytics", href: "/analytics", icon: BarChart3 },
  { labelKey: "layout.settings", href: "/settings", icon: Settings },
];

export function MobileNav({ initialPath = "" }: MobileNavProps) {
  const [pathname, setPathname] = useState(initialPath);
  const [locale, setLocale] = useState<ReturnType<typeof getCurrentLocale>>(defaultLocale);

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
    <nav className="mobile-nav" aria-label={t("layout.mobileNavAria")}>
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/planning"
            ? isPlanningRoute
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;
        return (
          <a
            key={tab.href}
            href={tab.href}
            className={`mobile-nav__item ${isActive ? "mobile-nav__item--active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="mobile-nav__icon-wrap">
              <Icon size={22} strokeWidth={1.75} />
              {tab.badge ? <span className="mobile-nav__badge">{tab.badge}</span> : null}
            </span>
            <span className="mobile-nav__label">{t(tab.labelKey)}</span>
          </a>
        );
      })}
    </nav>
  );
}
