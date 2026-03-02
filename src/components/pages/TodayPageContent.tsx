import { IslandErrorBoundary } from "@/components/layout/IslandErrorBoundary";
import { PageTransition } from "@/components/layout/PageTransition";
import { TodayScreen } from "@/components/today/TodayScreen";

/**
 * Wrapper that keeps the full React tree (TodayScreen + PageTransition + IslandErrorBoundary)
 * inside one client island. Astro passes children of client components as static HTML,
 * so without this wrapper TodayScreen would not hydrate and its hooks would not run.
 */
export function TodayPageContent() {
  return (
    <IslandErrorBoundary>
      <PageTransition>
        <TodayScreen />
      </PageTransition>
    </IslandErrorBoundary>
  );
}
