import { useCallback, useEffect, useMemo, useState } from "react";
import { I18nProvider } from "@/context/I18nContext";
import { BUDDY_CHECKIN_POLL_MS } from "@/lib/constants";
import { getPersistedUser } from "@/lib/auth";
import { Button, Card, Skeleton, Spinner } from "@/components/ui";
import { useTranslation } from "@/i18n/useTranslation";
import { trackEvent } from "@/lib/tracking";
import {
  acceptPairRequest,
  createCheckin,
  getCheckins,
  getPairRequests,
  getPartner,
  getPartnerSummary,
  rejectPairRequest,
  requestPairByEmail,
} from "./api";
import { CheckinComposer } from "./CheckinComposer";
import { CheckinHistory } from "./CheckinHistory";
import { PairSetup } from "./PairSetup";
import { PartnerStatus } from "./PartnerStatus";
import type { Checkin, PairRequest, PairState, Partner, PartnerStatusViewModel } from "./types";
import { offsetDate, toDateKey, toDateKeyInTimezone, toPartnerStatus } from "./utils";
import "./BuddyOverview.css";

function BuddyOverviewContent() {
  const { t } = useTranslation();
  const genericErrorMessage = t("accountability.errors.generic");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [requests, setRequests] = useState<PairRequest[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [status, setStatus] = useState<PartnerStatusViewModel>({
    dayClosed: null,
    oneDone: null,
    reflectionDone: null,
    streak: 0,
  });
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUserId(getPersistedUser()?.id ?? null);
  }, []);

  const pairState: PairState = useMemo(() => {
    if (partner) {
      return "paired";
    }
    if (requests.length > 0) {
      return "pending";
    }
    return "none";
  }, [partner, requests.length]);

  const loadData = useCallback(
    async (nextState: "initial" | "refresh" = "initial") => {
      if (nextState === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      try {
        const [partnerData, pairRequests] = await Promise.all([getPartner(), getPairRequests()]);
        setPartner(partnerData);
        setRequests(pairRequests);

        if (!partnerData) {
          setCheckins([]);
          setStatus({ dayClosed: null, oneDone: null, reflectionDone: null, streak: 0 });
          return;
        }

        const today = toDateKey(new Date());
        const partnerToday =
          partnerData.timezone != null ? toDateKeyInTimezone(partnerData.timezone) : null;
        const historyStart = toDateKey(offsetDate(new Date(), -30));
        const [summaryDays, recentCheckins] = await Promise.all([
          getPartnerSummary(historyStart, today),
          getCheckins(historyStart, today),
        ]);

        setStatus(toPartnerStatus(summaryDays, today, partnerToday));
        setCheckins(recentCheckins);
      } catch {
        setError(genericErrorMessage);
      } finally {
        if (nextState === "initial") {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [genericErrorMessage],
  );

  useEffect(() => {
    void loadData("initial");
  }, [loadData]);

  useEffect(() => {
    if (pairState !== "paired") {
      return;
    }
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (document.visibilityState === "visible") {
        intervalId = window.setInterval(() => {
          void loadData("refresh");
        }, BUDDY_CHECKIN_POLL_MS);
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startPolling();
      } else {
        stopPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pairState, loadData]);

  const sortedCheckins = useMemo(
    () => [...checkins].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [checkins],
  );

  return (
    <section className="buddy-overview" aria-label={t("accountability.page.ariaLabel")}>
      <header className="buddy-overview__header">
        <div>
          <h1>{t("accountability.page.title")}</h1>
          <p>{t("accountability.page.subtitle")}</p>
        </div>
        <Button variant="secondary" onClick={() => void loadData("refresh")} loading={refreshing}>
          {t("accountability.page.refresh")}
        </Button>
      </header>

      {loading ? (
        <Card className="buddy-overview__state-card">
          <Spinner size="md" />
          <Skeleton lines={3} />
        </Card>
      ) : null}

      {!loading && error ? (
        <Card className="buddy-overview__state-card" variant="accent">
          <p>{error}</p>
          <Button variant="secondary" onClick={() => void loadData("initial")}>
            {t("common.retry")}
          </Button>
        </Card>
      ) : null}

      {!loading && !error && pairState !== "paired" ? (
        <PairSetup
          currentUserId={currentUserId}
          requests={requests}
          loading={refreshing}
          onInvite={async (email) => {
            await requestPairByEmail(email);
            await loadData("refresh");
          }}
          onAccept={async (requestId) => {
            await acceptPairRequest(requestId);
            await loadData("refresh");
          }}
          onReject={async (requestId) => {
            await rejectPairRequest(requestId);
            await loadData("refresh");
          }}
        />
      ) : null}

      {!loading && !error && pairState === "paired" ? (
        <div className="buddy-overview__paired">
          <PartnerStatus partnerEmail={partner?.email ?? null} status={status} />
          <CheckinComposer
            disabled={false}
            loading={checkinLoading}
            onSubmit={async (message) => {
              setCheckinLoading(true);
              try {
                await createCheckin(message);
                trackEvent("buddy_checkin_sent");
                await loadData("refresh");
              } finally {
                setCheckinLoading(false);
              }
            }}
          />
          <CheckinHistory checkins={sortedCheckins} currentUserId={currentUserId} />
        </div>
      ) : null}
    </section>
  );
}

export function BuddyOverview() {
  return (
    <I18nProvider>
      <BuddyOverviewContent />
    </I18nProvider>
  );
}
