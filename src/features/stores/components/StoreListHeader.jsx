import SectionTitle from "../../../shared/components/ui/SectionTitle";

export default function StoreListHeader() {
  return (
    <>
      <div className="px-4 py-3">
        <p className="text-body">
          Showing stores within 5 km of your location in{" "}
          <span className="font-semibold">Dhaka.</span>
        </p>
      </div>

      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <SectionTitle className="text-[20px] sm:text-[22px] md:text-[24px]">
          Stores Near You
        </SectionTitle>
        <button className="text-sm font-semibold text-emerald-700">
          See All
        </button>
      </div>
    </>
  );
}