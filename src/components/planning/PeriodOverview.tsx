import { useState } from "react";
import { I18nProvider } from "@/context/I18nContext";
import { useTranslation } from "@/i18n/useTranslation";
import { QuarterStart } from "./QuarterStart";
import { MonthStart } from "./MonthStart";
import { WeekStart } from "./WeekStart";
import "./PeriodOverview.css";

type TabId = "quarter" | "month" | "week";

function PeriodOverviewContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>("week");

  return (
    <section className="period-overview" aria-label={t("planning.overview.title")}>
      <header className="period-overview__header">
        <h1>{t("planning.overview.title")}</h1>
        <p>{t("planning.overview.subtitle")}</p>
      </header>

      <div className="period-overview__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "quarter"}
          className={`period-overview__tab ${activeTab === "quarter" ? "period-overview__tab--active" : ""}`}
          onClick={() => setActiveTab("quarter")}
        >
          {t("planning.overview.tabs.quarter")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "month"}
          className={`period-overview__tab ${activeTab === "month" ? "period-overview__tab--active" : ""}`}
          onClick={() => setActiveTab("month")}
        >
          {t("planning.overview.tabs.month")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "week"}
          className={`period-overview__tab ${activeTab === "week" ? "period-overview__tab--active" : ""}`}
          onClick={() => setActiveTab("week")}
        >
          {t("planning.overview.tabs.week")}
        </button>
      </div>

      <div className="period-overview__content" role="tabpanel">
        {activeTab === "quarter" && <QuarterStart />}
        {activeTab === "month" && <MonthStart />}
        {activeTab === "week" && <WeekStart />}
      </div>
    </section>
  );
}

export function PeriodOverview() {
  return (
    <I18nProvider>
      <PeriodOverviewContent />
    </I18nProvider>
  );
}
