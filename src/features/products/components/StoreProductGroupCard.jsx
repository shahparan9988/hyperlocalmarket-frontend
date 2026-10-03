import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  ShoppingBag,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ProductPreviewSlide from "./ProductPreviewSlide";

export default function StoreProductGroupCard({
  group,
  isSelected,
  onSelectStore,
  onViewMatches,
  onVisitStore,
  onViewProduct,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const products = group.products.slice(0, 5);
  const store = group.store;

  useEffect(() => {
    setActiveIndex(0);
  }, [group.store.id, products.length]);

  const activeProduct = products[activeIndex];
  const nextProduct = useMemo(
    () => products[(activeIndex + 1) % products.length],
    [activeIndex, products]
  );

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? products.length - 1 : current - 1
    );
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % products.length);
  };

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white transition ${
        isSelected
          ? "border-emerald-500 shadow-md ring-2 ring-emerald-100"
          : "border-stone-200 shadow-sm hover:border-stone-300 hover:shadow-md"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelectStore(store.id)}
        className="flex w-full items-start gap-3 px-4 pb-3 pt-4 text-left"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
          <Store className="h-5 w-5" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <span className="truncate text-base font-bold text-stone-900">
              {store.name}
            </span>
            <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
              {store.distanceText}
            </span>
          </span>

          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-stone-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {store.rating}
            </span>
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                store.isOpen ? "text-emerald-700" : "text-stone-500"
              }`}
            >
              <Clock3 className="h-3.5 w-3.5" />
              {store.isOpen ? "Open" : "Closed"}
            </span>
            <span className="font-medium text-stone-500">
              {group.matchingProductCount} trimmers found
            </span>
          </span>
        </span>
      </button>

      <div className="border-y border-stone-100 bg-stone-50/60 px-4 py-3">
        <div className="flex items-center gap-2">
          {products.length > 1 && (
            <button
              type="button"
              onClick={showPrevious}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm hover:border-emerald-300 hover:text-emerald-700"
              aria-label="Previous product"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <ProductPreviewSlide
              product={activeProduct}
              onViewProduct={(product) => onViewProduct(group, product)}
            />
          </div>

          {/* {products.length > 1 && (
            <button
              type="button"
              onClick={showNext}
              className="group relative hidden h-[104px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-white sm:block"
              aria-label={`Next product: ${nextProduct.name}`}
            >
              <img
                src={nextProduct.imageUrl}
                alt=""
                className="h-full w-full object-cover opacity-75 transition group-hover:opacity-100"
              />
              <span className="absolute inset-0 grid place-items-center bg-stone-900/5">
                <ChevronRight className="h-5 w-5 rounded-full bg-white/90 p-0.5 text-stone-700 shadow" />
              </span>
            </button>
          )} */}

          {products.length > 1 && (
            <button
              type="button"
              onClick={showNext}
              className="
                group relative grid h-8 w-8 shrink-0 place-items-center
                overflow-hidden rounded-full
                border border-stone-200 bg-white
                text-stone-600 shadow-sm
                hover:border-emerald-300 hover:text-emerald-700                    
                sm:h-[104px] sm:w-[72px] sm:rounded-xl
              "
              aria-label={`Next product: ${nextProduct.name}`}
            >
              {/* Product preview only appears from the sm breakpoint */}
              <img
                src={nextProduct.imageUrl}
                alt=""
                className="
                  hidden h-full w-full object-cover opacity-75 transition
                  group-hover:opacity-100
                  sm:block
                "
              />

              {/* Arrow remains visible on every screen size */}
              <span
                className="
                  absolute inset-0 grid place-items-center bg-white
                  sm:bg-stone-900/5
                "
              >
                <ChevronRight
                  className="
                    h-4 w-4 text-stone-700
                    sm:h-5 sm:w-5 sm:rounded-full
                    sm:bg-white/90 sm:p-0.5 sm:shadow
                  "
                />
              </span>
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 pl-10 text-[11px] text-stone-500">
          <span>
            {activeIndex + 1} of {products.length}
          </span>
          <span className="flex items-center gap-2">
            {store.isDeliveryAvailable && (
              <span className="inline-flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" /> Delivery
              </span>
            )}
            {store.isPickupAvailable && (
              <span className="inline-flex items-center gap-1">
                <ShoppingBag className="h-3.5 w-3.5" /> Pickup
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3 sm:flex-row">
        <button
          type="button"
          onClick={() => onViewMatches(group)}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-emerald-600 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
        >
          View all {group.matchingProductCount} trimmers
        </button>
        <button
          type="button"
          onClick={() => onVisitStore(store)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100"
        >
          <MapPin className="h-3.5 w-3.5" />
          Visit store
        </button>
      </div>
    </article>
  );
}
