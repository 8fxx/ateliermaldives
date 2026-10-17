export type SeedProduct = {
  slug: string;
  name: string;
  category: "Tops" | "Bottoms" | "Accessories";
  price: number; // USD cents
  colorway: string;
  description: string;
  details: string[];
  sizes: string[];
  // Two-tone palette used by <ProductArt> until real photography exists
  palette: [string, string];
  badge?: string;
};

export const seedProducts: SeedProduct[] = [
  {
    slug: "lagoon-singlet",
    name: "Lagoon Singlet",
    category: "Tops",
    price: 6800,
    colorway: "Lagoon / Salt",
    description:
      "An open-mesh racing singlet cut for equatorial heat. Weighs next to nothing, dries before the next reef break.",
    details: ["Recycled Italian mesh", "Bonded hems, no chafe seams", "Reflective atoll mark", "92 g (size M)"],
    sizes: ["XS", "S", "M", "L", "XL"],
    palette: ["#0f6e78", "#e9f1ee"],
    badge: "New",
  },
  {
    slug: "atoll-split-short",
    name: "Atoll Split Short",
    category: "Bottoms",
    price: 8400,
    colorway: "Ink / Coral",
    description:
      "A 3\" split short with a brief liner and a rear zip pocket sized for a gel and a room key.",
    details: ["4-way stretch woven shell", "Antimicrobial liner", "Rear zip + 2 waistband pockets", "3\" inseam"],
    sizes: ["XS", "S", "M", "L", "XL"],
    palette: ["#111111", "#e8643c"],
  },
  {
    slug: "monsoon-shell",
    name: "Monsoon Shell",
    category: "Tops",
    price: 18800,
    colorway: "Sand",
    description:
      "A packable rain shell for southwest-monsoon tempo runs. Stuffs into its own chest pocket.",
    details: ["2.5L waterproof membrane", "Laser-cut back venting", "Packs into chest pocket", "148 g (size M)"],
    sizes: ["S", "M", "L", "XL"],
    palette: ["#d9cdb4", "#1d1d1b"],
    badge: "Limited",
  },
  {
    slug: "reef-long-sleeve",
    name: "Reef Long Sleeve",
    category: "Tops",
    price: 7600,
    colorway: "Coral / Ink",
    description:
      "UPF 50 long sleeve for midday miles. Thumb loops, a soft brushed collar and a quiet chest wordmark.",
    details: ["UPF 50+ merino blend", "Thumb loops", "Flatlock seams", "Odour resistant"],
    sizes: ["XS", "S", "M", "L", "XL"],
    palette: ["#e8643c", "#111111"],
  },
  {
    slug: "dhoni-cap",
    name: "Dhoni Cap",
    category: "Accessories",
    price: 4200,
    colorway: "Salt",
    description:
      "An unstructured five-panel running cap with a laser-perforated crown. Named after the boats that carry us between islands.",
    details: ["Ultralight nylon", "Perforated crown", "Sweat-wicking band", "One size, elastic back"],
    sizes: ["One size"],
    palette: ["#f2efe8", "#0f6e78"],
  },
  {
    slug: "tide-crew-sock",
    name: "Tide Crew Sock",
    category: "Accessories",
    price: 2200,
    colorway: "Lagoon stripe",
    description: "A cushioned crew sock with a compression arch and a lagoon stripe that ties the kit together.",
    details: ["Merino / nylon blend", "Targeted cushioning", "Arch compression", "Pack of 2"],
    sizes: ["S", "M", "L"],
    palette: ["#e9f1ee", "#0f6e78"],
  },
];
