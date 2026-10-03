import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import { productError } from "../utils/productModel";

function EditorLoader({ productId, onReload }) {
  const { api, storeId } = useOutletContext();
  const [result, setResult] = useState({ product: null, error: "" });
  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    let active = true;
    api.get(productId, controller.signal).then((product) => { if (active) setResult({ product, error: "" }); })
      .catch((error) => { if (active) setResult({ product: null, error: productError(error) }); });
    return () => { active = false; controller.abort(); };
  }, [api, productId]);
  if (!productId) return <ProductForm />;
  if (result.error) return <section className="hlmp-panel"><p className="hlmp-error" role="alert">{result.error}</p><div className="hlmp-actions">
    <button className="hlmp-button" onClick={onReload}>Retry</button><Link className="hlmp-button" to={`/seller/stores/${storeId}/products`}>Back to products</Link></div></section>;
  if (!result.product) return <p role="status">Loading product…</p>;
  return <ProductForm initialProduct={result.product} onReload={onReload} />;
}

export default function ProductEditorPage() {
  const { productId } = useParams();
  const [revision, setRevision] = useState(0);
  return <EditorLoader key={`${productId || "new"}:${revision}`} productId={productId} onReload={() => setRevision((value) => value + 1)} />;
}