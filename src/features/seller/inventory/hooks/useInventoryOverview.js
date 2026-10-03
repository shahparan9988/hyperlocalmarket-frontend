import { useEffect, useState } from "react";
import { useStoreSetupStore } from "../../storeSetup/state/useStoreSetupStore";
import { getInventoryContext, getInventoryOverview } from "../services/inventoryApi";
import { inventoryError } from "../utils/inventoryModel";

export default function useInventoryOverview(storeId, filters) {
  const [revision, setRevision] = useState(0);
  const [overview, setOverview] = useState(null);
  const [context, setContext] = useState(null);
  const requestKey = JSON.stringify([storeId, filters, revision]);
  const contextKey = JSON.stringify([storeId, revision]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    getInventoryOverview(storeId, filters, controller.signal)
      .then((data) => {
        if (active) setOverview({ key: requestKey, data, error: "" });
      })
      .catch((error) => {
        if (active) setOverview({ key: requestKey, data: null, error: inventoryError(error) });
      });

    return () => { active = false; controller.abort(); };
  }, [storeId, filters, requestKey]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    // Follow ProductsLayout's existing seller-header loading pattern.
    useStoreSetupStore.getState().reset();

    getInventoryContext(storeId, controller.signal)
      .then((data) => {
        if (!active) return;
        setContext({ key: contextKey, data, error: "" });
        useStoreSetupStore.setState({ store: data.store });
      })
      .catch((error) => {
        if (active) setContext({ key: contextKey, data: null, error: inventoryError(error) });
      });

    return () => { active = false; controller.abort(); };
  }, [storeId, contextKey]);

  // Never show a previous store/filter's rows while its replacement is loading.
  const currentOverview = overview?.key === requestKey ? overview : null;
  const currentContext = context?.key === contextKey ? context : null;

  return {
    result: currentOverview?.data ?? null,
    error: currentOverview?.error ?? "",
    loading: currentOverview === null,
    categories: currentContext?.data?.categories ?? [],
    categoriesLoading: currentContext === null,
    categoriesError: currentContext?.error ?? "",
    refresh: () => setRevision((value) => value + 1),
  };
}
