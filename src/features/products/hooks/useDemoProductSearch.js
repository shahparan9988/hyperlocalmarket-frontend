import { useMemo } from "react";
import { DEMO_PRODUCT_STORE_GROUPS } from "../data/demoProductStoreGroups";

function matchesQuery(product, query) {
  if (!query) return true;

  const searchableText = [
    product.name,
    product.brand,
    product.model,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
}

export function useDemoProductSearch(searchTerm) {
  return useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const storeGroups = DEMO_PRODUCT_STORE_GROUPS.map((group) => {
      const groupMatchesQuery = group.searchTerms.some((term) =>
        term.includes(query)
      );
      const products = group.products
        .filter(
          (product) => groupMatchesQuery || matchesQuery(product, query)
        )
        .slice(0, 5);

      return {
        ...group,
        products,
      };
    }).filter((group) => group.products.length > 0);

    const mapStores = storeGroups.map((group) => ({
      ...group.store,
      matchingProductCount: group.matchingProductCount,
      lowestMatchingProductPrice: group.lowestMatchingProductPrice,
      markerPriceText: `${group.matchingProductCount} · From ৳${group.lowestMatchingProductPrice.toLocaleString("en-BD")}`,
      products: group.products,
    }));

    return { storeGroups, mapStores };
  }, [searchTerm]);
}
