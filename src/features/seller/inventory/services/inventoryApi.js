import { apiClient } from "../../../../shared/api/apiClient";
import { getProductEditorData } from "../../products/services/productApi";
import { categoryLabel, createCategoryIndex } from "../../products/utils/categoryTree";
import { STOCK_FILTERS, toInventoryParams } from "../utils/inventoryModel";

const prefix = import.meta.env.VITE_API_PATH_PREFIX || "";

export async function getInventoryOverview(storeId, filters, signal) {
  const { data } = await apiClient.get(
    `${prefix}/stores/${encodeURIComponent(storeId)}/inventory`,
    { params: toInventoryParams(filters), signal },
  );

  if (!Array.isArray(data?.results.items) || !Number.isInteger(data.results.totalCount) ||
      data.results.totalCount < 0 || data.results.pageNumber !== filters.page || data.results.pageSize !== filters.pageSize ||
      STOCK_FILTERS.some(({ key }) => !Number.isInteger(data.summary?.[key]) || data.summary[key] < 0)) {
    throw new Error("The inventory response does not match the INV-01 API contract.");
  }
  return data;
}

export async function getInventoryContext(storeId, signal) {
  const data = await getProductEditorData(storeId, signal);
  const index = createCategoryIndex(data.storeCategories);
  const categories = data.storeCategories.map((category) => ({
    id: category.id,
    label: categoryLabel(index, category.id),
  })).sort((first, second) => first.label.localeCompare(second.label));

  return { store: data.store, categories };
}
