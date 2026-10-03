/**
 * RouteControls
 * Handles route mode selection + toggle button
 */
export default function RouteControls({
  routeMode,
  onRouteModeChange,
  shouldDrawRoute,
  onToggleRoute,
}) {
  return (
    <div className="border-t border-stone-200 bg-white p-4">
      <label className="mb-2 block text-sm font-medium text-stone-700">
        Route mode
      </label>

      <select
        value={routeMode}
        onChange={(e) => onRouteModeChange(e.target.value)}
        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
      >
        <option value="driving">Driving</option>
        <option value="driving-traffic">Driving with traffic</option>
        <option value="walking">Walking</option>
        <option value="cycling">Cycling</option>
      </select>

      <button
        onClick={onToggleRoute}
        className="mt-4 w-full rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
      >
        {shouldDrawRoute ? "Hide Route" : "Show Route"}
      </button>
    </div>
  );
}