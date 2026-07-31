import type { Product } from "./types";

const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "pro-pickleball-paddle-carbon-x",
    sku: "PDBL-CBX-01",
    name: "Pro Pickleball Paddle Carbon X",
    brand: "JOOLA",
    material: "Carbon Fiber",
    price: 2500000,
    stock: 5,
    status: "ready",
    description:
      "Dirancang untuk pemain agresif modern, Carbon X menghadirkan spin dan kontrol tak tertandingi. Permukaan raw carbon fiber memaksimalkan gesekan sehingga Anda dapat membentuk pukulan dengan presisi, sementara inti polimer 16mm memberi sentuhan lembut pada dink dan reset.",
    images: ["/products/paddle-black.svg", "/products/paddle-black-2.svg"],
    createdAt: "2026-06-01",
    specs: {
      weight: "7.8 - 8.2 oz",
      weightAvg: 8.0,
      thickness: "16 mm",
      surface: "Raw Carbon Fiber",
      core: "Polymer Honeycomb",
    },
  },
  {
    id: "2",
    slug: "picklestock-speedster-pro",
    sku: "PS-SPD-02",
    name: "PickleStock Speedster Pro",
    brand: "Selkirk",
    material: "Fiberglass",
    price: 1800000,
    stock: 0,
    status: "preorder",
    description:
      "Raket fiberglass bertenaga untuk pemain yang mengutamakan kecepatan bola. Permukaan bertekstur memberi kontrol ekstra pada servis dan drive.",
    images: ["/products/paddle-red.svg"],
    createdAt: "2026-05-20",
    specs: {
      weight: "7.6 - 8.0 oz",
      weightAvg: 7.8,
      thickness: "13 mm",
      surface: "Textured Fiberglass",
      core: "Polymer Honeycomb",
    },
  },
  {
    id: "3",
    slug: "control-spin-master",
    sku: "CRBN-CSM-03",
    name: "Control Spin Master",
    brand: "CRBN",
    material: "Carbon Fiber",
    price: 3100000,
    stock: 3,
    status: "ready",
    description:
      "Raket kontrol premium dengan permukaan raw carbon fiber penuh. Pilihan pemain yang mengandalkan permainan net dan penempatan bola presisi.",
    images: ["/products/paddle-black-2.svg", "/products/paddle-black.svg"],
    createdAt: "2026-06-15",
    specs: {
      weight: "8.0 - 8.4 oz",
      weightAvg: 8.2,
      thickness: "16 mm",
      surface: "Raw Carbon Fiber",
      core: "Polypropylene Honeycomb",
    },
  },
  {
    id: "4",
    slug: "lite-speed-wave",
    sku: "HEAD-LSW-04",
    name: "Lite Speed Wave",
    brand: "Head",
    material: "Composite",
    price: 1200000,
    stock: 0,
    status: "preorder",
    description:
      "Raket komposit ringan yang ramah untuk pemula. Bobot rendah mengurangi kelelahan lengan pada permainan panjang.",
    images: ["/products/paddle-blue.svg"],
    createdAt: "2026-04-10",
    specs: {
      weight: "7.2 - 7.6 oz",
      weightAvg: 7.4,
      thickness: "13 mm",
      surface: "Composite",
      core: "Polymer Honeycomb",
    },
  },
  {
    id: "5",
    slug: "joola-hyperion-cfs",
    sku: "PDBL-HYP-05",
    name: "Hyperion CFS Swift",
    brand: "JOOLA",
    material: "Carbon Fiber",
    price: 2900000,
    stock: 2,
    status: "ready",
    description:
      "Kombinasi tenaga dan kontrol dengan gagang memanjang untuk jangkauan lebih luas. Cocok untuk pemain dua tangan pada sisi backhand.",
    images: ["/products/paddle-black.svg"],
    createdAt: "2026-07-05",
    specs: {
      weight: "8.2 - 8.6 oz",
      weightAvg: 8.4,
      thickness: "14 mm",
      surface: "Carbon Friction Surface",
      core: "Polymer Honeycomb",
    },
  },
  {
    id: "6",
    slug: "selkirk-amped-epic",
    sku: "PS-AMP-06",
    name: "Amped Epic Control",
    brand: "Selkirk",
    material: "Composite",
    price: 1650000,
    stock: 8,
    status: "ready",
    description:
      "Raket serbaguna dengan sweet spot lebar. Pilihan aman bagi pemain menengah yang sedang membangun konsistensi pukulan.",
    images: ["/products/paddle-blue.svg"],
    createdAt: "2026-03-22",
    specs: {
      weight: "7.4 - 7.8 oz",
      weightAvg: 7.6,
      thickness: "13 mm",
      surface: "FiberFlex",
      core: "X5 Core",
    },
  },
];

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
