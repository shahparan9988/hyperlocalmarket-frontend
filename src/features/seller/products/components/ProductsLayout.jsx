import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useAuthStore } from "../../../auth/state/authStore";
import { useStoreSetupStore } from "../../storeSetup/state/useStoreSetupStore";
import { createProductApi } from "../services/productApi";
import { createCategoryIndex } from "../utils/categoryTree";
import { productError } from "../utils/productModel";
import "../products.css";

function ProductsSession({ storeId, actorId, onRetry }) {
  const [connection] = useState(() => {
    try {
      return { api: createProductApi({ storeId, actorId, store: useStoreSetupStore.getState().store }) };
    } catch (error) { return { error: productError(error) }; }
  });
  const [result, setResult] = useState({ data: null, error: connection.error || "" });
  const api = connection.api;
  useEffect(() => {
    if (!api) return;
    const controller = new AbortController();
    let active = true;
    // Invalidate outstanding setup loads before updating the shared seller header.
    useStoreSetupStore.getState().reset();
    api.bootstrap(controller.signal).then((data) => {
      if (!active) return;
      createCategoryIndex(data.storeCategories);
      createCategoryIndex(data.marketplaceCategories);
      setResult({ data, error: "" });
      useStoreSetupStore.setState({ store: data.store });
    }).catch((error) => { if (active) setResult({ data: null, error: productError(error) }); });
    return () => { active = false; controller.abort(); };
  }, [api]);
  const addCategory = (node) => setResult((current) => ({ ...current, data: {
    ...current.data, storeCategories: [...current.data.storeCategories.filter((item) => item.id !== node.id), node],
  } }));
  return <div className="hlm-products">
    {api?.isDemo && <div className="hlmp-notice">Demo mode: changes are saved in this browser for this account and store.</div>}
    {result.error ? <div className="hlmp-panel"><p className="hlmp-error" role="alert">{result.error}</p>
      <button className="hlmp-button" onClick={onRetry}>Retry</button></div>
      : !result.data ? <p role="status">Loading products workspace…</p>
        : <Outlet context={{ api, data: result.data, addCategory, storeId }} />}
  </div>;
}

export default function ProductsLayout() {
  const { storeId } = useParams();
  const actorId = useAuthStore((state) => state.userId);
  const [attempt, setAttempt] = useState(0);
  return <ProductsSession key={`${actorId}:${storeId}:${attempt}`} storeId={storeId} actorId={actorId}
    onRetry={() => setAttempt((value) => value + 1)} />;
}
