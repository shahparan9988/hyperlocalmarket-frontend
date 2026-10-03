import { useEffect, useState } from "react";
import { fetchStores } from "../api/storeApi";

export function useStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStores() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchStores();

        if (active) {
          setStores(Array.isArray(data) ? data : []);
        }
      } catch {
        if (active) {
          setError("Failed to load stores.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStores();

    return () => {
      active = false;
    };
  }, []);

  return { stores, loading, error };
}