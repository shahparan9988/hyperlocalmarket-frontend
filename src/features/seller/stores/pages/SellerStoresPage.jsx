import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, LoaderCircle, MapPin, Plus, Store } from "lucide-react";
import storeSetupApi from "../../storeSetup/services/storeSetupApi";
import { useStoreSetupStore } from "../../storeSetup/state/useStoreSetupStore";
import styles from "./SellerStoresPage.module.css";

function getLoadError(error) {
  const status = error?.response?.status;
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to view these stores.";
  if (status === 404) {
    return "The store-list API was not found. Check or implement GET /api/stores/mine.";
  }
  return error?.response?.data?.message || error?.response?.data?.title ||
    error?.message || "We could not load your stores. Please try again.";
}

function parseStores(result) {
  // The API returns an array, or an object containing an items array.
  const items = Array.isArray(result) ? result : result?.items;
  if (!Array.isArray(items) || items.some((store) =>
    !store || typeof store.id !== "string" || !store.id.trim()
  )) {
    throw new Error("The store-list API must return stores with an id for each store.");
  }
  return items;
}

function StoreCard({ store, onManage }) {
  const address = store.location?.address;
  const addressText = [address?.addressLine1, address?.locality, address?.region]
    .filter(Boolean).join(", ");
  // Do not guess the meaning of backend numeric enum values.
  const status = String(store.status ?? "Status unavailable");
  const statusClass = status.toLowerCase() === "active" ? styles.active : styles.neutral;

  return (
    <article className={styles.storeCard}>
      <div className={styles.cardTop}>
        <span className={styles.icon}><Store size={22} aria-hidden="true" /></span>
        <span className={`${styles.badge} ${statusClass}`}>{status}</span>
      </div>
      <h3>{store.name || "Unnamed store"}</h3>
      <p className={styles.address}>
        <MapPin size={16} aria-hidden="true" />
        <span>{addressText || "Address not provided"}</span>
      </p>
      <button
        type="button"
        className={`${styles.button} ${styles.secondary}`}
        onClick={() => onManage(store.id)}
        aria-label={`Manage ${store.name || "store"}`}
      >
        Manage store <ArrowRight size={16} aria-hidden="true" />
      </button>
    </article>
  );
}

export default function SellerStoresPage() {
  const navigate = useNavigate();
  const resetSetup = useStoreSetupStore((state) => state.reset);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadStores() {
      setIsLoading(true);
      setError("");
      setNeedsLogin(false);
      try {
        const result = await storeSetupApi.getMyStores();
        if (active) setStores(parseStores(result));
      } catch (loadError) {
        if (active) {
          setError(getLoadError(loadError));
          setNeedsLogin(loadError?.response?.status === 401);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadStores();
    // Ignore responses from a previous request or after leaving this page.
    return () => { active = false; };
  }, [reloadKey]);

  function openWorkspace(path) {
    // Clears browser state only. No store is deleted from the database.
    resetSetup();
    navigate(path);
  }

  function manageStore(storeId) {
    openWorkspace(`/seller/stores/${encodeURIComponent(storeId)}/setup`);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/map" className={styles.brand}>
          <span className={styles.brandMark}>H</span>
          <span>HyperLocal<span className={styles.green}>Market</span></span>
        </Link>
        <Link to="/map" className={styles.back}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to marketplace
        </Link>
      </header>

      <main className={styles.content}>
        <p className={styles.eyebrow}>SELL ON HLM</p>
        <h1>What would you like to do?</h1>
        <p className={styles.intro}>Create a new store or continue setting up an existing one.</p>

        <section className={styles.createCard} aria-labelledby="create-store-heading">
          <div>
            <h2 id="create-store-heading">Create a new store</h2>
            <p>Start with your business name, type and location.</p>
          </div>
          <button
            type="button"
            className={`${styles.button} ${styles.primary}`}
            onClick={() => openWorkspace("/seller/stores/new")}
          >
            <Plus size={18} aria-hidden="true" /> Create a new store
          </button>
        </section>

        <section aria-labelledby="your-stores-heading" aria-busy={isLoading}>
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="your-stores-heading">Your stores</h2>
              <p>Choose the store you want to manage.</p>
            </div>
            {!isLoading && !error && <span className={styles.count}>{stores.length} stores</span>}
          </div>

          {isLoading ? (
            <div className={styles.message} role="status">
              <LoaderCircle className={styles.spinner} size={24} aria-hidden="true" />
              Loading your stores…
            </div>
          ) : error ? (
            <div className={`${styles.message} ${styles.error}`}>
              <p role="alert">{error}</p>
              {needsLogin ? (
                <Link to="/login" className={`${styles.button} ${styles.secondary}`}>Sign in</Link>
              ) : (
                <button type="button" className={`${styles.button} ${styles.secondary}`}
                  onClick={() => setReloadKey((key) => key + 1)}>
                  Try again
                </button>
              )}
            </div>
          ) : stores.length === 0 ? (
            <div className={styles.message}>
              <Store size={30} aria-hidden="true" />
              <h3>You do not have a store yet</h3>
              <p>Use “Create a new store” above to get started.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} onManage={manageStore} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
