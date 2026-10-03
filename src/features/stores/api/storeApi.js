// import apiClient from "../../../shared/services/apiClient";

// export async function fetchStores(params = {}) {
//   const response = await apiClient.get("/stores", { params });
//   return response.data;
// }

export async function fetchStores() {
  return [
    {
      id: 1,
      name: "Fresh Mart",
      category: "Grocery",
      distance: "0.8 km",
      rating: 4.9,
      reviews: 320,
      subtitle: "Fruits, Vegetables, Dairy & More...",
      price: "Tk 30-130",
      mapX: "52%",
      mapY: "28%",
      markerColor: "emerald",
      iconType: "store",
    },
    {
      id: 2,
      name: "Fresh Fish Corner",
      category: "Fresh Fish",
      distance: "1.1 km",
      rating: 4.7,
      reviews: 255,
      subtitle: "Hilsa, Rohu, Catfish, Prawns, & More...",
      price: "Tk 30-130",
      mapX: "78%",
      mapY: "42%",
      markerColor: "teal",
      iconType: "fish",
    },
    {
      id: 3,
      name: "Local Butcher",
      category: "Meat",
      distance: "1.4 km",
      rating: 4.5,
      reviews: 187,
      subtitle: "Chicken, Beef, Mutton",
      price: "Tk 30-150",
      mapX: "68%",
      mapY: "72%",
      markerColor: "rose",
      iconType: "beef",
    },
    {
      id: 4,
      name: "Javed Pharmacy",
      category: "Pharmacy",
      distance: "1.2 km",
      rating: 4.7,
      reviews: 201,
      subtitle: "Medicines, Essentials & Wellness",
      price: "Starting from Tk 50",
      mapX: "82%",
      mapY: "57%",
      markerColor: "cyan",
      iconType: "pill",
    },
  ];
}