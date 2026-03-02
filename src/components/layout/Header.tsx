import { Menu, RefreshCw, Settings, WifiOff } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { dateFormats, defaultLocale, dateFnsLocales } from "@/i18n/config";
import { getCurrentLocale, translateForLocale } from "@/i18n/runtime";
import "./Header.css";

type SyncStatus = "synced" | "syncing" | "offline" | "error";

export function Header() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [locale, setLocale] = useState<ReturnType<typeof getCurrentLocale>>(defaultLocale);
  const t = useMemo(
    () => (key: string, values?: Record<string, string | number>) => translateForLocale(locale, key, values),
    [locale],
  );
  const today = format(new Date(), dateFormats[locale], {
    locale: dateFnsLocales[locale],
  });

  useEffect(() => {
    setLocale(getCurrentLocale());
    setSyncStatus(navigator.onLine ? "synced" : "offline");

    const statusHandler = (event: Event) => {
      const customEvent = event as CustomEvent<{ status: SyncStatus }>;
      if (customEvent.detail?.status) {
        setSyncStatus(customEvent.detail.status);
      }
    };

    const onlineHandler = () => setSyncStatus("synced");
    const offlineHandler = () => setSyncStatus("offline");

    window.addEventListener("onlytoday:sync-status", statusHandler);
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);
    return () => {
      window.removeEventListener("onlytoday:sync-status", statusHandler);
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, []);

  const syncLabel =
    syncStatus === "syncing"
      ? t("common.syncing")
      : syncStatus === "offline"
        ? t("common.offline")
        : syncStatus === "error"
          ? t("common.syncError")
          : t("common.synced");

  return (
    <header className="app-header">
      {syncStatus === "offline" ? (
        <div className="app-header__offline-banner" role="status">
          <WifiOff size={14} />
          <span>{t("common.offline")}</span>
        </div>
      ) : null}
      <div className="app-header__desktop">
        <p className="app-header__date" aria-label={t("layout.todayIs", { date: today })}>
          {today}
        </p>
        <p className="app-header__streak" aria-label={t("layout.currentStreakAria")}>
          {t("layout.streak", { count: 0 })}
        </p>
        <p className={`app-header__sync app-header__sync--${syncStatus}`} aria-live="polite">
          <RefreshCw size={14} className={syncStatus === "syncing" ? "app-header__sync-icon--spin" : ""} />
          {syncLabel}
        </p>
        <a href="/settings" className="app-header__settings-link" aria-label={t("layout.settingsAria")}>
          <Settings size={20} strokeWidth={1.75} />
        </a>
      </div>

      <div className="app-header__mobile">
        <a href="/today" className="app-header__logo" aria-label={t("layout.homeAria")}>
          OT
        </a>
        <p className="app-header__date">{today}</p>
        <button type="button" className="app-header__menu-button" aria-label={t("layout.openMenu")}>
          <Menu size={20} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
