import { Card } from "@/components/ui";
import { useTranslation } from "@/i18n/useTranslation";
import type { Checkin } from "./types";
import "./CheckinHistory.css";

type CheckinHistoryProps = {
  checkins: Checkin[];
  currentUserId: string | null;
};

function senderLabel(currentUserId: string | null, authorUserId: string, authorEmail: string | null, t: (key: string) => string): string {
  if (currentUserId && currentUserId === authorUserId) {
    return t("accountability.history.you");
  }
  return authorEmail || t("accountability.history.partner");
}

export function CheckinHistory({ checkins, currentUserId }: CheckinHistoryProps) {
  const { formatDate, t } = useTranslation();

  return (
    <Card as="section" className="checkin-history" aria-label={t("accountability.history.ariaLabel")}>
      <h2>{t("accountability.history.title")}</h2>
      {checkins.length === 0 ? (
        <p className="checkin-history__empty">{t("accountability.history.empty")}</p>
      ) : (
        <ul className="checkin-history__list">
          {checkins.map((checkin) => {
            const ownMessage = currentUserId ? checkin.authorUserId === currentUserId : false;
            return (
              <li
                key={checkin.id}
                className={`checkin-history__item ${ownMessage ? "checkin-history__item--self" : "checkin-history__item--partner"}`}
              >
                <header>
                  <strong>{senderLabel(currentUserId, checkin.authorUserId, checkin.authorEmail, t)}</strong>
                  <time dateTime={checkin.createdAt}>{formatDate(new Date(checkin.createdAt))}</time>
                </header>
                <p>{checkin.message}</p>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
