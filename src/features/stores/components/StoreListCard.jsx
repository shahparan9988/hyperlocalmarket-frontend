// import { MessageSquare, Navigation } from "lucide-react";
// import AppButton from "../../../shared/components/ui/AppButton";

// function Stars({ rating, reviews }) {
//   return (
//     <div className="flex items-center gap-1 text-xs text-stone-600">
//       <div className="text-amber-400">★★★★★</div>
//       <span className="font-medium">{rating}</span>
//       <span>{reviews}</span>
//     </div>
//   );
// }

// export default function StoreListCard({ store }) {
//   return (
//     <div className="panel-card p-4">
//       <div className="flex gap-4">
//         <div className="h-24 w-28 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-200 via-lime-100 to-stone-200" />

//         <div className="min-w-0 flex-1">
//           <div className="flex items-start justify-between gap-3">
//             <div className="min-w-0">
//               <h3 className="truncate text-[15px] font-semibold text-stone-800">
//                 {store.name}
//               </h3>
//               <p className="text-sm text-stone-600">{store.category}</p>

//               <div className="mt-1">
//                 <Stars rating={store.rating} reviews={store.reviews} />
//               </div>
//             </div>

//             <span className="shrink-0 whitespace-nowrap text-sm text-stone-700">
//               {store.distance}
//             </span>
//           </div>

//           <p className="mt-3 truncate text-xs text-stone-500">
//             {store.subtitle}
//           </p>

//           <div className="mt-4 flex flex-col gap-3">
//             <span className="text-[15px] font-semibold text-stone-800">
//               {store.price}
//             </span>

//             <div className="flex flex-wrap gap-2">
//               <AppButton className="px-3 py-2">
//                 <MessageSquare className="mr-1 h-3.5 w-3.5" />
//                 Chat
//               </AppButton>

//               <AppButton className="px-3 py-2">
//                 <Navigation className="mr-1 h-3.5 w-3.5" />
//                 Navigate
//               </AppButton>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


/**
 * StoreListCard
 * Displays a single store item
 * Handles selection state and click
 */
export default function StoreListCard({
  store,
  isSelected,
  onSelect,
}) {
  return (
    <button
      onClick={onSelect}
      className={`block w-full rounded-2xl border p-3 text-left transition ${
        isSelected
          ? "border-emerald-600 bg-emerald-50 shadow-sm"
          : "border-stone-200 bg-white hover:bg-stone-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-stone-800">
            {store.name}
          </div>

          <div className="mt-1 text-xs text-stone-500">
            {store.category}
          </div>

          {store.address && (
            <div className="mt-1 text-xs text-stone-400">
              {store.address}
            </div>
          )}
        </div>

        {/* Distance */}
        {store.distanceText && (
          <div className="shrink-0 rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">
            {store.distanceText}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="font-medium text-amber-500">
          ★ {store.rating}
        </span>

        {isSelected && (
          <span className="rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-700">
            Selected
          </span>
        )}
      </div>
    </button>
  );
}