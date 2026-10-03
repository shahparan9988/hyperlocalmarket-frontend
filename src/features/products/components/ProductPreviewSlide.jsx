import { ImageOff } from "lucide-react";
import { useState } from "react";

function formatPrice(amount) {
  return `৳${amount.toLocaleString("en-BD")}`;
}

export default function ProductPreviewSlide({ product, onViewProduct }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="grid min-w-0 grid-cols-[104px_minmax(0,1fr)] gap-3">
      <button
        type="button"
        onClick={() => onViewProduct(product)}
        className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-stone-100"
        aria-label={`View ${product.name}`}
      >
        {imageFailed ? (
          <ImageOff className="h-7 w-7 text-stone-400" />
        ) : (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
          />
        )}
      </button>

      <div className="min-w-0 py-0.5">
        <button
          type="button"
          onClick={() => onViewProduct(product)}
          className="block max-w-full text-left"
        >
          <h3 className="truncate text-sm font-bold text-stone-900 hover:text-emerald-700">
            {product.name}
          </h3>
        </button>

        <p className="mt-1 truncate text-xs text-stone-500">
          {product.brand} · Model {product.model}
        </p>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-base font-bold text-emerald-700">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-stone-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        <p
          className={`mt-1.5 text-xs font-semibold ${
            product.stockStatus === "In stock"
              ? "text-emerald-700"
              : "text-amber-700"
          }`}
        >
          {product.stockStatus}
        </p>
      </div>
    </div>
  );
}

