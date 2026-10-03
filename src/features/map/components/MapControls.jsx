import { LocateFixed, Minus, Plus } from "lucide-react";

export default function MapControls() {
  return (
    <>
      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg sm:right-5 sm:top-4">
        <button className="flex h-12 w-12 items-center justify-center border-b border-stone-200 sm:h-14 sm:w-14">
          <Plus className="h-5 w-5 text-stone-700 sm:h-6 sm:w-6" />
        </button>
        <button className="flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14">
          <Minus className="h-5 w-5 text-stone-700 sm:h-6 sm:w-6" />
        </button>
      </div>

      <div className="absolute bottom-4 right-3 sm:bottom-5 sm:right-5">
        <button className="flex h-10 items-center rounded-2xl border border-stone-200 bg-white px-3 text-xs text-stone-700 shadow-lg sm:h-12 sm:px-4 sm:text-sm">
          <LocateFixed className="mr-2 h-4 w-4 text-sky-500" />
          Locate Me
        </button>
      </div>
    </>
  );
}