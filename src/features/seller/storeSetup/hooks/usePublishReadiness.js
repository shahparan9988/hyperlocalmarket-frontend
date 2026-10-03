import { useMemo } from "react";
import { useStoreSetupStore } from "../state/useStoreSetupStore";

export default function usePublishReadiness() {
  const setupStatus = useStoreSetupStore((state) => state.setupStatus);

  return useMemo(() => {
    const completed = setupStatus?.completedCount ?? 0;
    const total = setupStatus?.totalCount ?? 6;
    const requiredCompleted = setupStatus?.requiredCompletedCount ?? 0;
    const requiredTotal = setupStatus?.requiredTotalCount ?? 3;

    return {
      sections: setupStatus?.sections ?? [],
      isPublished: setupStatus?.status === "Active",
      requiredSetupComplete: requiredTotal > 0 && requiredCompleted === requiredTotal,
      completed,
      total,
      requiredCompleted,
      requiredTotal,
      overallPercentage: total ? Math.round((completed / total) * 100) : 0,
      requiredPercentage: requiredTotal
        ? Math.round((requiredCompleted / requiredTotal) * 100)
        : 0,
      canPublish: Boolean(setupStatus?.canPublish),
      canAcceptOrders: Boolean(setupStatus?.canAcceptOrders),
      nextRecommendedSection: setupStatus?.nextRecommendedSection ?? null,
    };
  }, [setupStatus]);
}
