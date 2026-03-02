import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui";
import { useTranslation } from "@/i18n/useTranslation";
import type { PartnerStatusViewModel } from "./types";
import "./PartnerStatus.css";

type PartnerStatusProps = {
  partnerEmail: string | null;
  status: PartnerStatusViewModel;
};

type IndicatorValue = boolean | null;

function StatusIndicator({ label, value }: { label: string; value: IndicatorValue }) {
  if (value === true) {
    return (
      <li className="partner-status__item partner-status__item--success">
        <CheckCircle2 size={18} aria-hidden="true" />
        <span>{label}</span>
      </li>
    );
  }

  if (value === false) {
    return (
      <li className="partner-status__item partner-status__item--error">
        <XCircle size={18} aria-hidden="true" />
        <span>{label}</span>
      </li>
    );
  }

  return (
    <li className="partner-status__item partner-status__item--unknown">
      <HelpCircle size={18} aria-hidden="true" />
      <span>{label}</span>
    </li>
  );
}

export function PartnerStatus({ partnerEmail, status }: PartnerStatusProps) {
  const { t } = useTranslation();

  return (
    <Card className="partner-status" as="section" aria-label={t("accountability.partner.ariaLabel")}>
      <header className="partner-status__header">
        <div>
          <h2>{t("accountability.partner.title")}</h2>
          <p>{partnerEmail || t("accountability.partner.unknownEmail")}</p>
        </div>
        <div className="partner-status__streak" aria-label={t("accountability.partner.streakLabel")}>
          <strong>{status.streak}</strong>
          <span>{t("accountability.partner.streakDays")}</span>
        </div>
      </header>

      <ul className="partner-status__list">
        <StatusIndicator label={t("accountability.partner.dayClosed")} value={status.dayClosed} />
        <StatusIndicator label={t("accountability.partner.oneDone")} value={status.oneDone} />
        <StatusIndicator label={t("accountability.partner.reflectionDone")} value={status.reflectionDone} />
      </ul>
    </Card>
  );
}
