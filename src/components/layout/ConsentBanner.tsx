import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { getAnalyticsConsent, setAnalyticsConsent } from "@/lib/tracking";
import "./ConsentBanner.css";

export function ConsentBanner() {
  const [consent, setConsent] = useState<ReturnType<typeof getAnalyticsConsent>>("unknown");

  useEffect(() => {
    setConsent(getAnalyticsConsent());
  }, []);

  if (consent !== "unknown") {
    return null;
  }

  return (
    <div className="consent-banner" role="status" aria-live="polite">
      <p>We gebruiken alleen analytics met jouw toestemming. Kies wat je wil delen.</p>
      <div className="consent-banner__actions">
        <Button
          variant="secondary"
          onClick={() => {
            setAnalyticsConsent("denied");
            setConsent("denied");
          }}
        >
          Niet toestaan
        </Button>
        <Button
          onClick={() => {
            setAnalyticsConsent("granted");
            setConsent("granted");
            window.location.reload();
          }}
        >
          Toestaan
        </Button>
      </div>
    </div>
  );
}
