import { useMemo, useState } from "react";
import { Mail, UserPlus, Users } from "lucide-react";
import { Button, Card, EmptyState, Input } from "@/components/ui";
import { useTranslation } from "@/i18n/useTranslation";
import type { PairRequest } from "./types";
import "./PairSetup.css";

type PairSetupProps = {
  currentUserId: string | null;
  requests: PairRequest[];
  loading: boolean;
  onInvite: (email: string) => Promise<void>;
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
};

export function PairSetup({ currentUserId, requests, loading, onInvite, onAccept, onReject }: PairSetupProps) {
  const { formatDate, t } = useTranslation();
  const genericErrorMessage = t("accountability.errors.generic");
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const incomingRequests = useMemo(
    () => requests.filter((request) => currentUserId && request.toUserId === currentUserId),
    [currentUserId, requests],
  );
  const outgoingRequests = useMemo(
    () => requests.filter((request) => currentUserId && request.fromUserId === currentUserId),
    [currentUserId, requests],
  );

  async function handleInviteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = inviteEmail.trim();
    if (!nextEmail) {
      setError(t("accountability.errors.emailRequired"));
      return;
    }

    setError(null);
    setInviteLoading(true);
    try {
      await onInvite(nextEmail);
      setInviteEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : genericErrorMessage);
    } finally {
      setInviteLoading(false);
    }
  }

  async function withRequestAction(requestId: string, action: (id: string) => Promise<void>) {
    setError(null);
    setActiveRequestId(requestId);
    try {
      await action(requestId);
    } catch (err) {
      setError(err instanceof Error ? err.message : genericErrorMessage);
    } finally {
      setActiveRequestId(null);
    }
  }

  return (
    <section className="pair-setup" aria-label={t("accountability.setup.ariaLabel")}>
      <EmptyState
        icon={<Users size={28} />}
        title={t("accountability.setup.emptyTitle")}
        description={t("accountability.setup.emptyDescription")}
      />

      <Card className="pair-setup__invite">
        <h2>{t("accountability.setup.inviteTitle")}</h2>
        <p>{t("accountability.setup.inviteDescription")}</p>
        <form className="pair-setup__form" onSubmit={handleInviteSubmit}>
          <Input
            type="email"
            label={t("accountability.setup.emailLabel")}
            placeholder={t("accountability.setup.emailPlaceholder")}
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            leftIcon={<Mail size={16} />}
            required
          />
          <Button type="submit" loading={inviteLoading || loading} leftIcon={<UserPlus size={16} />}>
            {t("accountability.setup.sendInvite")}
          </Button>
        </form>
        <p className="pair-setup__hint">{t("accountability.setup.inviteHint")}</p>
        {error ? (
          <p className="pair-setup__error" role="alert">
            {error}
          </p>
        ) : null}
      </Card>

      <Card className="pair-setup__requests">
        <h2>{t("accountability.setup.requestsTitle")}</h2>

        <div className="pair-setup__request-columns">
          <section aria-label={t("accountability.setup.incomingTitle")}>
            <h3>{t("accountability.setup.incomingTitle")}</h3>
            {incomingRequests.length === 0 ? (
              <p className="pair-setup__empty">{t("accountability.setup.noIncoming")}</p>
            ) : (
              <ul className="pair-setup__request-list">
                {incomingRequests.map((request) => (
                  <li key={request.id} className="pair-setup__request-item">
                    <div>
                      <strong>{t("accountability.setup.requestFrom", { userId: request.fromUserId })}</strong>
                      <p>{formatDate(new Date(request.createdAt))}</p>
                    </div>
                    <div className="pair-setup__request-actions">
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={activeRequestId === request.id}
                        onClick={() => void withRequestAction(request.id, onAccept)}
                      >
                        {t("accountability.setup.accept")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={activeRequestId === request.id}
                        onClick={() => void withRequestAction(request.id, onReject)}
                      >
                        {t("accountability.setup.reject")}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label={t("accountability.setup.outgoingTitle")}>
            <h3>{t("accountability.setup.outgoingTitle")}</h3>
            {outgoingRequests.length === 0 ? (
              <p className="pair-setup__empty">{t("accountability.setup.noOutgoing")}</p>
            ) : (
              <ul className="pair-setup__request-list">
                {outgoingRequests.map((request) => (
                  <li key={request.id} className="pair-setup__request-item pair-setup__request-item--outgoing">
                    <div>
                      <strong>{t("accountability.setup.requestTo", { userId: request.toUserId })}</strong>
                      <p>{formatDate(new Date(request.createdAt))}</p>
                    </div>
                    <span className="pair-setup__status">{t("accountability.setup.pending")}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </Card>
    </section>
  );
}
