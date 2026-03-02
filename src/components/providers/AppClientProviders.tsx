import { useState } from "react";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { SyncConflictDialog } from "@/components/layout/SyncConflictDialog";
import { ThemeProvider } from "@/context/ThemeContext";
import { I18nProvider } from "@/context/I18nContext";
import { AuthProvider } from "@/context/AuthContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";

function SyncBootstrap() {
  const [submitting, setSubmitting] = useState(false);
  const { pendingConflict, resolveConflict } = useOfflineSync({ autoStart: true });

  return (
    <>
      <SyncConflictDialog
        conflict={pendingConflict}
        submitting={submitting}
        onChooseLocal={async () => {
          setSubmitting(true);
          try {
            await resolveConflict("use_local");
          } finally {
            setSubmitting(false);
          }
        }}
        onChooseServer={async () => {
          setSubmitting(true);
          try {
            await resolveConflict("use_server");
          } finally {
            setSubmitting(false);
          }
        }}
      />
      <ConsentBanner />
    </>
  );
}

export function AppClientProviders() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <SyncBootstrap />
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
