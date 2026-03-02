import { IslandErrorBoundary } from "@/components/layout/IslandErrorBoundary";
import { PageTransition } from "@/components/layout/PageTransition";
import { PeriodOverview } from "@/components/planning/PeriodOverview";

/**
 * Wrapper that keeps the full React tree (PeriodOverview + PageTransition + IslandErrorBoundary)
 * inside one client island. Astro passes children of client components as static HTML,
 * so without this wrapper the planning components would not hydrate and their hooks would not run.
 */
export function PlanningPageContent() {
  return (
    <IslandErrorBoundary>
      <PageTransition>
        <PeriodOverview />
      </PageTransition>
    </IslandErrorBoundary>
  );
}
