import StoreCard from "./StoreCard";

export default function StoreList({ stores }) {
  if (!stores.length) {
    return <p>No stores found.</p>;
  }

  return (
    <div>
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}