// import StoreListCard from "./StoreListCard";
// import StoreListHeader from "./StoreListHeader";

// export default function StoreListPanel({ stores }) {
//   return (
//     <aside className="h-full overflow-y-auto border-r border-stone-200 bg-stone-50">
//       <StoreListHeader />
//       <div className="space-y-3 px-4 pb-4">
//         {stores.slice(0, 3).map((store) => (
//           <StoreListCard key={store.id} store={store} />
//         ))}
//       </div>
//     </aside>
//   );
// }

import StoreListCard from "./StoreListCard";
import StoreListHeader from "./StoreListHeader";
import RouteControls from "./RouteControls";

/**
 * StoreListPanel
 * Responsible only for layout + passing props to children
 */
export default function StoreListPanel({
  stores,
  selectedStore,
  onSelectStore,
  routeMode,
  onRouteModeChange,
  shouldDrawRoute,
  onToggleRoute,
}) {
  return (
    <aside className="h-full overflow-y-auto border-r border-stone-200 bg-stone-50">
      <StoreListHeader />

      {/* Store List */}
      <div className="space-y-3 px-4 pb-4">
        {stores.map((store) => (
          <StoreListCard
            key={store.id}
            store={store}
            isSelected={selectedStore?.id === store.id}
            onSelect={() => onSelectStore(store.id)}
          />
        ))}
      </div>

      {/* Route Controls (separated component) */}
      <RouteControls
        routeMode={routeMode}
        onRouteModeChange={onRouteModeChange}
        shouldDrawRoute={shouldDrawRoute}
        onToggleRoute={onToggleRoute}
      />
    </aside>
  );
}