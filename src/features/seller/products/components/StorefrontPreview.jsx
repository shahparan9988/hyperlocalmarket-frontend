import { useMemo, useState } from "react";
import { Package, Store } from "lucide-react";
import { categoryLabel, categoryLevels, createCategoryIndex } from "../utils/categoryTree";
import { availableQuantity, priceLabel } from "../utils/productModel";
import { offeredVariants, variantName } from "../utils/variantOptions";
import CatalogDialog from "./CatalogDialog";

export function ProductThumbnail({ product, large = false }) {
  const image = product.images[0];
  return <div className={large ? "hlmp-preview-image" : "hlmp-thumbnail"}>
    {image?.imageUrl ? <img src={image.imageUrl} alt={product.name || "Product"} /> : <Package size={large ? 44 : 24} aria-hidden="true" />}
  </div>;
}

export default function StorefrontPreview({ product, data, expanded = false }) {
  const index = useMemo(() => createCategoryIndex(data.storeCategories), [data.storeCategories]);
  const [browseId, setBrowseId] = useState(null);
  const selectedId = expanded ? browseId : product.storeCategoryId;
  const levels = categoryLevels(index, selectedId);
  const variants = offeredVariants(product);
  const available = variants.length > 0 && (product.trackInventory ? availableQuantity(product) > 0 : product.manualAvailability === "Available");
  const store = data.store;
  const visible = !expanded || !selectedId || isInside(index, product.storeCategoryId, selectedId);
  return <div className={`hlmp-storefront${expanded ? " is-expanded" : ""}`}>
    <div className="hlmp-store-cover">{store.coverImageUrl && <img src={store.coverImageUrl} alt="Store cover" />}</div>
    <div className="hlmp-store-identity">
      <span className="hlmp-store-logo">{store.logoUrl ? <img src={store.logoUrl} alt="Store logo" /> : <Store size={25} />}</span>
      <div><strong>{store.name || "Your store"}</strong><small>Store preview</small></div>
    </div>
    <nav className="hlmp-store-menu" aria-label="Store categories">
      <button type="button" className={!selectedId ? "is-selected" : ""} onClick={() => setBrowseId(null)} disabled={!expanded}>All products</button>
      {levels[0]?.items.map((node) => <button type="button" key={node.id} disabled={!expanded}
        className={levels[0].selectedId === node.id ? "is-selected" : ""} onClick={() => setBrowseId(node.id)}>{node.name}</button>)}
    </nav>
    {expanded && levels.slice(1).map((level) => <nav className="hlmp-store-menu hlmp-submenu" key={level.parentId} aria-label={`Category level ${level.depth + 1}`}>
      {level.items.map((node) => <button type="button" key={node.id} className={level.selectedId === node.id ? "is-selected" : ""} onClick={() => setBrowseId(node.id)}>{node.name}</button>)}
    </nav>)}
    <div className="hlmp-preview-body">
      <p className="hlmp-path hlmp-muted">{categoryLabel(index, expanded ? selectedId : product.storeCategoryId)}</p>
      {visible ? <><ProductThumbnail product={product} large />
        <div className="hlmp-preview-copy"><small>{product.type === "Service" ? "Service" : variants.length > 1 ? `${variants.length} variants` : "Product"}</small>
          <h3>{product.name || "Your product name"}</h3><strong>{priceLabel(product)}</strong>
          <span className={`hlmp-pill${available ? " is-green" : " is-muted"}`}>{available ? "Available" : "Currently unavailable"}</span>
          {expanded && <><p className="hlmp-description">{product.description}</p>
            {variants.length > 1 && <p>{product.options?.map((o) => o.name).join(" / ") || product.variantOptionName || "Options"}: {variants.map((v) => variantName(product.options || [], v.selections, v.name)).join(", ")}</p>}
            {product.type === "Product" && <p className="hlmp-muted">{product.isPickupAvailable ? "Pickup available. " : ""}
              {product.deliveryOptionIds.length ? "Delivery: " + data.deliveryOptions.filter((o) => product.deliveryOptionIds.includes(o.id)).map((o) => o.name).join(", ") : "Contact the seller to arrange fulfilment."}</p>}</>}
        </div></> : <p className="hlmp-empty">This product is in a different category. This preview shows only the current product.</p>}
    </div>
  </div>;
}

function isInside(index, id, ancestor) {
  while (id) { if (id === ancestor) return true; id = index.byId.get(id)?.parentId; }
  return false;
}

export function ProductPreviewDialog({ product, data, onClose }) {
  return <CatalogDialog title="Storefront preview" onClose={onClose} wide>
    <p className="hlmp-muted">Preview this listing with your store branding and category menu.</p>
    <StorefrontPreview product={product} data={data} expanded />
  </CatalogDialog>;
}
