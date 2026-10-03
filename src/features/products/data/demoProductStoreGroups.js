const image = (label, background = "ECFDF5", foreground = "047857") =>
  `https://placehold.co/360x360/${background}/${foreground}?text=${encodeURIComponent(label)}`;

export const DEMO_PRODUCT_STORE_GROUPS = [
  
     {
    searchTerms: [
      "trimmer",
      "beard trimmer",
      "hair clipper",
      "grooming kit",
    ],
    store: {
      id: "store-new-market-appliances",
      slug: "new-market-appliances",
      name: "New Market Appliances",
      businessType: "Home appliances",
      addressText: "New Market, Dhaka",
      latitude: 23.7332,
      longitude: 90.3853,
      distanceText: "2.4 km",
      rating: 4.5,
      isOpen: true,
      isDeliveryAvailable: false,
      isPickupAvailable: true,
    },
    matchingProductCount: 11,
    lowestMatchingProductPrice: 1099,
    products: [
      {
        id: "new-market-nova-nht-1073",
        slug: "nova-professional-trimmer-nht-1073",
        name: "Nova Professional Trimmer",
        brand: "Nova",
        model: "NHT-1073",
        imageUrl: image(
          "Nova NHT-1073",
          "FFF7ED",
          "9A3412"
        ),
        price: 1099,
        compareAtPrice: 1399,
        stockStatus: "In stock",
      },
      {
        id: "new-market-geemy-gm-657",
        slug: "geemy-rechargeable-trimmer-gm-657",
        name: "Geemy Rechargeable Trimmer",
        brand: "Geemy",
        model: "GM-657",
        imageUrl: image(
          "Geemy GM-657",
          "F0FDFA",
          "115E59"
        ),
        price: 1499,
        compareAtPrice: 1799,
        stockStatus: "In stock",
      },
      {
        id: "new-market-kemei-km-5027",
        slug: "kemei-hair-trimmer-km-5027",
        name: "Kemei Hair Trimmer",
        brand: "Kemei",
        model: "KM-5027",
        imageUrl: image(
          "Kemei KM-5027",
          "FFF7ED",
          "C2410C"
        ),
        price: 1349,
        compareAtPrice: 1599,
        stockStatus: "Only 4 left",
      },
      {
        id: "new-market-vgr-v071",
        slug: "vgr-professional-trimmer-v071",
        name: "VGR Professional Trimmer",
        brand: "VGR",
        model: "V-071",
        imageUrl: image(
          "VGR V-071",
          "FAF5FF",
          "7E22CE"
        ),
        price: 2599,
        compareAtPrice: 2899,
        stockStatus: "In stock",
      },
      {
        id: "new-market-vintage-t9",
        slug: "vintage-t9-professional-trimmer",
        name: "Vintage T9 Trimmer",
        brand: "Vintage",
        model: "T9",
        imageUrl: image(
          "Vintage T9",
          "FFFBEB",
          "B45309"
        ),
        price: 1149,
        compareAtPrice: null,
        stockStatus: "In stock",
      },
    ],
  },

  {
    searchTerms: [
      "trimmer",
      "cordless trimmer",
      "hair clipper",
      "grooming",
    ],
    store: {
      id: "store-uttara-gadget-house",
      slug: "uttara-gadget-house",
      name: "Uttara Gadget House",
      businessType: "Gadgets",
      addressText: "Sector 7, Uttara",
      latitude: 23.8759,
      longitude: 90.3795,
      distanceText: "3.0 km",
      rating: 4.9,
      isOpen: true,
      isDeliveryAvailable: true,
      isPickupAvailable: true,
    },
    matchingProductCount: 9,
    lowestMatchingProductPrice: 1899,
    products: [
      {
        id: "uttara-xiaomi-grooming-pro",
        slug: "xiaomi-grooming-kit-pro",
        name: "Xiaomi Grooming Kit Pro",
        brand: "Xiaomi",
        model: "BHR6395IN",
        imageUrl: image(
          "Xiaomi Pro",
          "EFF6FF",
          "1D4ED8"
        ),
        price: 4399,
        compareAtPrice: 4799,
        stockStatus: "In stock",
      },
      {
        id: "uttara-philips-bt3231",
        slug: "philips-series-3000-bt3231",
        name: "Philips Series 3000 Trimmer",
        brand: "Philips",
        model: "BT3231",
        imageUrl: image(
          "Philips BT3231",
          "F5F5F4",
          "1C1917"
        ),
        price: 3899,
        compareAtPrice: 4299,
        stockStatus: "Only 3 left",
      },
      {
        id: "uttara-wahl-color-pro",
        slug: "wahl-color-pro-cordless",
        name: "Wahl Color Pro Cordless",
        brand: "Wahl",
        model: "9649P",
        imageUrl: image(
          "Wahl Color Pro",
          "FEF2F2",
          "B91C1C"
        ),
        price: 5499,
        compareAtPrice: 5999,
        stockStatus: "In stock",
      },
      {
        id: "uttara-panasonic-er-gb37",
        slug: "panasonic-beard-trimmer-er-gb37",
        name: "Panasonic Beard Trimmer",
        brand: "Panasonic",
        model: "ER-GB37",
        imageUrl: image(
          "Panasonic GB37",
          "F0FDF4",
          "15803D"
        ),
        price: 4999,
        compareAtPrice: 5399,
        stockStatus: "In stock",
      },
      {
        id: "uttara-hoco-hp31",
        slug: "hoco-electric-trimmer-hp31",
        name: "Hoco Electric Trimmer",
        brand: "Hoco",
        model: "HP31",
        imageUrl: image(
          "Hoco HP31",
          "F8FAFC",
          "334155"
        ),
        price: 1899,
        compareAtPrice: 2099,
        stockStatus: "In stock",
      },
    ],
  },

  {
    searchTerms: [
      "trimmer",
      "beard trimmer",
      "hair clipper",
      "grooming kit",
    ],
    store: {
      id: "store-mirpur-electronics",
      slug: "mirpur-electronics",
      name: "Mirpur Electronics",
      businessType: "Electronics",
      addressText: "Mirpur 10, Dhaka",
      latitude: 23.8067,
      longitude: 90.3687,
      distanceText: "3.3 km",
      rating: 4.4,
      isOpen: true,
      isDeliveryAvailable: true,
      isPickupAvailable: true,
    },
    matchingProductCount: 7,
    lowestMatchingProductPrice: 949,
    products: [
      {
        id: "mirpur-kemei-km-2299",
        slug: "kemei-cordless-trimmer-km-2299",
        name: "Kemei Cordless Trimmer",
        brand: "Kemei",
        model: "KM-2299",
        imageUrl: image(
          "Kemei KM-2299",
          "F0FDFA",
          "0F766E"
        ),
        price: 949,
        compareAtPrice: 1199,
        stockStatus: "In stock",
      },
      {
        id: "mirpur-nova-nht-1073",
        slug: "nova-professional-trimmer-nht-1073",
        name: "Nova Professional Trimmer",
        brand: "Nova",
        model: "NHT-1073",
        imageUrl: image(
          "Nova NHT-1073",
          "FFF7ED",
          "9A3412"
        ),
        price: 1199,
        compareAtPrice: 1449,
        stockStatus: "In stock",
      },
      {
        id: "mirpur-geemy-gm-657",
        slug: "geemy-rechargeable-trimmer-gm-657",
        name: "Geemy Rechargeable Trimmer",
        brand: "Geemy",
        model: "GM-657",
        imageUrl: image(
          "Geemy GM-657",
          "F0FDFA",
          "115E59"
        ),
        price: 1399,
        compareAtPrice: 1699,
        stockStatus: "Only 2 left",
      },
      {
        id: "mirpur-enchen-boost",
        slug: "enchen-boost-hair-clipper",
        name: "Enchen Boost Hair Clipper",
        brand: "Enchen",
        model: "Boost",
        imageUrl: image(
          "Enchen Boost",
          "EFF6FF",
          "0369A1"
        ),
        price: 1449,
        compareAtPrice: 1699,
        stockStatus: "In stock",
      },
      {
        id: "mirpur-philips-bt1230",
        slug: "philips-beard-trimmer-bt1230",
        name: "Philips Beard Trimmer",
        brand: "Philips",
        model: "BT1230",
        imageUrl: image("Philips BT1230"),
        price: 2099,
        compareAtPrice: 2399,
        stockStatus: "In stock",
      },
    ],
  },

  {
    searchTerms: [
      "trimmer",
      "premium trimmer",
      "beard trimmer",
      "grooming kit",
    ],
    store: {
      id: "store-gulshan-tech-point",
      slug: "gulshan-tech-point",
      name: "Gulshan Tech Point",
      businessType: "Premium electronics",
      addressText: "Gulshan 1, Dhaka",
      latitude: 23.7808,
      longitude: 90.4161,
      distanceText: "1.8 km",
      rating: 4.9,
      isOpen: true,
      isDeliveryAvailable: true,
      isPickupAvailable: true,
    },
    matchingProductCount: 12,
    lowestMatchingProductPrice: 2799,
    products: [
      {
        id: "gulshan-vgr-v071",
        slug: "vgr-professional-trimmer-v071",
        name: "VGR Professional Trimmer",
        brand: "VGR",
        model: "V-071",
        imageUrl: image(
          "VGR V-071",
          "FAF5FF",
          "7E22CE"
        ),
        price: 2799,
        compareAtPrice: 3099,
        stockStatus: "In stock",
      },
      {
        id: "gulshan-braun-bt3221",
        slug: "braun-beard-trimmer-bt3221",
        name: "Braun Beard Trimmer 3",
        brand: "Braun",
        model: "BT3221",
        imageUrl: image(
          "Braun BT3221",
          "F8FAFC",
          "111827"
        ),
        price: 5299,
        compareAtPrice: 5799,
        stockStatus: "In stock",
      },
      {
        id: "gulshan-panasonic-er-gb37",
        slug: "panasonic-beard-trimmer-er-gb37",
        name: "Panasonic Beard Trimmer",
        brand: "Panasonic",
        model: "ER-GB37",
        imageUrl: image(
          "Panasonic GB37",
          "F0FDF4",
          "15803D"
        ),
        price: 5099,
        compareAtPrice: 5499,
        stockStatus: "Only 4 left",
      },
      {
        id: "gulshan-remington-mb4130",
        slug: "remington-beard-boss-mb4130",
        name: "Remington Beard Boss",
        brand: "Remington",
        model: "MB4130",
        imageUrl: image(
          "Remington MB4130",
          "F5F5F4",
          "292524"
        ),
        price: 4699,
        compareAtPrice: null,
        stockStatus: "In stock",
      },
      {
        id: "gulshan-philips-bt3231",
        slug: "philips-series-3000-bt3231",
        name: "Philips Series 3000 Trimmer",
        brand: "Philips",
        model: "BT3231",
        imageUrl: image(
          "Philips BT3231",
          "F5F5F4",
          "1C1917"
        ),
        price: 3999,
        compareAtPrice: 4399,
        stockStatus: "In stock",
      },
    ],
  },

  {
    searchTerms: [
      "trimmer",
      "beard trimmer",
      "hair clipper",
      "grooming",
    ],
    store: {
      id: "store-farmgate-electronics",
      slug: "farmgate-electronics",
      name: "Farmgate Electronics",
      businessType: "Home electronics",
      addressText: "Farmgate, Dhaka",
      latitude: 23.7572,
      longitude: 90.3894,
      distanceText: "2.0 km",
      rating: 4.6,
      isOpen: true,
      isDeliveryAvailable: true,
      isPickupAvailable: false,
    },
    matchingProductCount: 10,
    lowestMatchingProductPrice: 1049,
    products: [
      {
        id: "farmgate-kemei-km-2299",
        slug: "kemei-cordless-trimmer-km-2299",
        name: "Kemei Cordless Trimmer",
        brand: "Kemei",
        model: "KM-2299",
        imageUrl: image(
          "Kemei KM-2299",
          "F0FDFA",
          "0F766E"
        ),
        price: 1049,
        compareAtPrice: 1299,
        stockStatus: "In stock",
      },
      {
        id: "farmgate-nova-nht-1073",
        slug: "nova-professional-trimmer-nht-1073",
        name: "Nova Professional Trimmer",
        brand: "Nova",
        model: "NHT-1073",
        imageUrl: image(
          "Nova NHT-1073",
          "FFF7ED",
          "9A3412"
        ),
        price: 1249,
        compareAtPrice: 1499,
        stockStatus: "In stock",
      },
      {
        id: "farmgate-enchen-boost",
        slug: "enchen-boost-hair-clipper",
        name: "Enchen Boost Hair Clipper",
        brand: "Enchen",
        model: "Boost",
        imageUrl: image(
          "Enchen Boost",
          "EFF6FF",
          "0369A1"
        ),
        price: 1499,
        compareAtPrice: 1799,
        stockStatus: "In stock",
      },
      {
        id: "farmgate-philips-bt1230",
        slug: "philips-beard-trimmer-bt1230",
        name: "Philips Beard Trimmer",
        brand: "Philips",
        model: "BT1230",
        imageUrl: image("Philips BT1230"),
        price: 2149,
        compareAtPrice: 2449,
        stockStatus: "Only 3 left",
      },
      {
        id: "farmgate-vgr-v071",
        slug: "vgr-professional-trimmer-v071",
        name: "VGR Professional Trimmer",
        brand: "VGR",
        model: "V-071",
        imageUrl: image(
          "VGR V-071",
          "FAF5FF",
          "7E22CE"
        ),
        price: 2649,
        compareAtPrice: 2949,
        stockStatus: "In stock",
      },
    ],
  },

  {
    searchTerms: [
      "trimmer",
      "cordless trimmer",
      "hair clipper",
      "grooming kit",
    ],
    store: {
      id: "store-badda-gadget-zone",
      slug: "badda-gadget-zone",
      name: "Badda Gadget Zone",
      businessType: "Gadgets",
      addressText: "Middle Badda, Dhaka",
      latitude: 23.7807,
      longitude: 90.4265,
      distanceText: "2.7 km",
      rating: 4.5,
      isOpen: true,
      isDeliveryAvailable: true,
      isPickupAvailable: true,
    },
    matchingProductCount: 8,
    lowestMatchingProductPrice: 999,
    products: [
      {
        id: "badda-vintage-t9",
        slug: "vintage-t9-professional-trimmer",
        name: "Vintage T9 Trimmer",
        brand: "Vintage",
        model: "T9",
        imageUrl: image(
          "Vintage T9",
          "FFFBEB",
          "B45309"
        ),
        price: 999,
        compareAtPrice: 1199,
        stockStatus: "In stock",
      },
      {
        id: "badda-geemy-gm-657",
        slug: "geemy-rechargeable-trimmer-gm-657",
        name: "Geemy Rechargeable Trimmer",
        brand: "Geemy",
        model: "GM-657",
        imageUrl: image(
          "Geemy GM-657",
          "F0FDFA",
          "115E59"
        ),
        price: 1549,
        compareAtPrice: 1849,
        stockStatus: "Only 2 left",
      },
      {
        id: "badda-hoco-hp31",
        slug: "hoco-electric-trimmer-hp31",
        name: "Hoco Electric Trimmer",
        brand: "Hoco",
        model: "HP31",
        imageUrl: image(
          "Hoco HP31",
          "F8FAFC",
          "334155"
        ),
        price: 1699,
        compareAtPrice: 1949,
        stockStatus: "In stock",
      },
      {
        id: "badda-vgr-v071",
        slug: "vgr-professional-trimmer-v071",
        name: "VGR Professional Trimmer",
        brand: "VGR",
        model: "V-071",
        imageUrl: image(
          "VGR V-071",
          "FAF5FF",
          "7E22CE"
        ),
        price: 2699,
        compareAtPrice: 2999,
        stockStatus: "In stock",
      },
      {
        id: "badda-xiaomi-grooming-pro",
        slug: "xiaomi-grooming-kit-pro",
        name: "Xiaomi Grooming Kit Pro",
        brand: "Xiaomi",
        model: "BHR6395IN",
        imageUrl: image(
          "Xiaomi Pro",
          "EFF6FF",
          "1D4ED8"
        ),
        price: 4199,
        compareAtPrice: 4599,
        stockStatus: "In stock",
      },
    ],
  },
];
