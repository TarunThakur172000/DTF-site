import type { LucideIcon } from "lucide-react";
import {
  Layers,
  Shirt,
  PenTool,
  Trophy,
  CreditCard,
  Tags,
  MonitorPlay,
  Tent,
  Magnet,
  Flag,
  Award,
  ShieldCheck,
  Headset,
  Package,
  Clock3
} from "lucide-react";

const DTFtransfer = "/images/products/dtf-300x300.webp";
const GlitterDTFtransfer = "/images/products/glitter-DTF-3-300x300.webp";
const UVDTFtransfer = "/images/products/uv-dtf-300x300.webp";
const sublimationtransfer = "/images/products/sublimation-photo-300x300.webp";
const bussinesscards = "/images/bussinessCard.webp";
const Banner = "/images/Banner.webp";
const EventTent = "/images/EventTent.webp";
const flag = "/images/flag.webp";
const Magnetsticker = "/images/Magnetsticker.webp";
const Sticker = "/images/Sticker.webp";

export interface NavChild {
  label: string;
  to: string;
  description?: string;
  target: string;
}

export interface NavItem {
  label: string;
  to: string;
  children?: NavChild[];
}

export const NAV: NavItem[] = [
  {
    label: "Transfer Printing",
    to: "/transfer-printing",
    children: [
      { label: "DTF", to: "/transfer-printing/dtf", target: "", description: "Full-color transfers for any fabric" },
      { label: "UV DTF", to: "/transfer-printing/dtf-transfers", target: "", description: "Glossy transfers for hard surfaces" },
      { label: "Glitter DTF", to: "/transfer-printing/glitter-dtf-transfers", target: "", description: "Sparkle finish transfers" },
      { label: "Sublimation", to: "/transfer-printing/sublimation-transfers", target: "", description: "All-over dye printing" },
    ],
  },
  {
    label: "Promotional Products",
    to: "/promotional-products",
    children: [
      { label: "Business Cards", target: "", to: "/promotional-products/business-cards" },
      { label: "Stickers", target: "", to: "/promotional-products/stickers" },
      { label: "Banners", target: "", to: "/promotional-products/banners" },
      { label: "Tents", target: "", to: "/promotional-products/tents" },
      { label: "Magnets", target: "", to: "/promotional-products/magnets" },
      { label: "Flags", target: "", to: "/promotional-products/flags" },
    ],
  },
  { label: "Custom Apparel", to: "/custom-apparel" },
  { label: "Art Zone", to: "/art-zone" },
  { label: "Jerseys & Team Wear", to: "https://printpressrepeat.custombuilder.app" },
  { label: "Random Products", to: "/random-products" },
  { label: "About", to: "/about" },
  { label: "Instruction", to: "/instruction" },
];

export interface ServiceCard {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
}

export const HOME_SERVICES: ServiceCard[] = [
  {
    title: "Transfer Printing",
    description:
      "Premium DTF, UV DTF, glitter, and sublimation transfers with vibrant color, exceptional durability, and fast turnaround.",
    to: "/transfer-printing",
    icon: Layers,
  },
  {
    title: "Promotional Products",
    description:
      "Custom-branded products that help businesses stand out at events, in stores, and with every customer interaction.",
    to: "/promotional-products",
    icon: Tags,
  },
  {
    title: "Custom Apparel",
    description:
      "High-quality custom t-shirts, hoodies, polos, hats, and workwear for brands, teams, schools, and businesses.",
    to: "/custom-apparel",
    icon: Shirt,
  },
  {
    title: "Art Zone",
    description:
      "Professional vector conversion, logo digitizing, and artwork optimization to ensure every print looks its best.",
    to: "/art-zone",
    icon: PenTool,
  },
  {
    title: "Jerseys & Team Wear",
    description:
      "Fully customized sublimated jerseys and team apparel designed for schools, sports clubs, organizations, and events.",
    to: "https://printpressrepeat.custombuilder.app/",
    icon: Trophy,
  },
];

export const WHY_US = [
  {
    title: "Exceptional Print Quality",
    description:
      "Sharp details, vibrant colors, and premium materials that help your products stand out.",
    icon: Award,
  },
  {
    title: "Fast Turnaround",
    description:
      "Efficient production and reliable shipping to keep your projects moving on schedule.",
    icon: Clock3,
  },
  {
    title: "No Minimum Orders",
    description:
      "Whether you need one item or thousands, we provide the same attention to quality.",
    icon: Package,
  },
  {
    title: "Expert Support",
    description:
      "Our experienced team is here to help with artwork, product selection, and every step of your order.",
    icon: Headset,
  },
  {
    title: "Trusted by Businesses",
    description:
      "Serving apparel brands, schools, sports teams, organizations, and businesses with dependable printing solutions.",
    icon: ShieldCheck,
  },
];
export interface Product {
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  priceFrom: string;
}

export const FEATURED_PRODUCTS: Product[] = [
  {
    slug: "dtf-transfers",
    title: "DTF Transfers",
    category: "Transfer Printing",
    description:
      "Premium full-color DTF transfers with vibrant prints, exceptional durability, and ready-to-press convenience.",
    image: DTFtransfer,
    priceFrom: "From $0.04",
  },
  {
    slug: "glitter-dtf-transfers",
    title: "Glitter DTF Transfers",
    category: "Transfer Printing",
    description:
      "Add sparkle and dimension with premium glitter DTF transfers that deliver eye-catching results on every garment.",
    image: GlitterDTFtransfer,
    priceFrom: "From $0.05",
  },
  {
    slug: "uv-dtf-stickers",
    title: "UV DTF Stickers",
    category: "Transfer Printing",
    description:
      "Peel-and-stick UV DTF transfers for glass, plastic, metal, wood, acrylic, and other hard surfaces.",
    image: UVDTFtransfer,
    priceFrom: "From $0.07",
  },
  {
    slug: "sublimation-transfers",
    title: "Sublimation Transfers",
    category: "Transfer Printing",
    description:
      "High-quality sublimation transfers for polyester apparel, mugs, drinkware, and promotional products.",
    image: sublimationtransfer,
    priceFrom: "From $0.03",
  },
];

export const TESTIMONIALS = [
  {
    name: "Jessica Martinez",
    role: "Owner, Luna Apparel Co.",
    quote:
      "We've tried several transfer suppliers, but PrintPressRepeat consistently delivers vibrant colors, clean details, and fast turnaround. They've become an essential part of our production process.",
    rating: 5,
  },
  {
    name: "Michael Carter",
    role: "Owner, Carter Print Studio",
    quote:
      "The gang sheets save us time and money on every order. Quality is always consistent, and every transfer presses perfectly the first time.",
    rating: 5,
  },
  {
    name: "Ashley Nguyen",
    role: "Etsy Shop Owner",
    quote:
      "The UV DTF stickers exceeded my expectations. They're incredibly easy to apply, look premium, and my customers love the finished products.",
    rating: 5,
  },
  {
    name: "David Wilson",
    role: "Brand Manager, Elevate Athletics",
    quote:
      "From custom jerseys to DTF transfers, every order has arrived on time with outstanding print quality. It's great having one printing partner we can rely on.",
    rating: 5,
  },
];

export const TRUSTED_BRANDS = [
  "Northside Rec League", "Chandran Studio", "Reyes Coffee Co.", "Fielding & Co.",
  "Maple & Vine", "Union Fitness", "Harbor Print Guild", "Cedarline Apparel",
];

export const TRANSFER_METHODS = [
  {
    slug: "dtf",
    title: "DTF Transfers",
    subtitle: "Direct-to-film printing",
    description: "Full-color, photo-quality transfers that press onto cotton, polyester, blends and more — no weeding required.",
    applications: ["T-shirts & hoodies", "Tote bags", "Hats", "Athletic wear"],
    priceFrom: "$0.79 / transfer",
    imgsrc: DTFtransfer,
  },
  {
    slug: "uv-dtf",
    title: "UV DTF Transfers",
    subtitle: "Glossy hard-surface transfers",
    description: "UV-cured transfers with a durable glossy finish, built to stick to tumblers, laptops, signage and other rigid surfaces.",
    applications: ["Tumblers & mugs", "Laptop decals", "Signage", "Product packaging"],
    priceFrom: "$0.95 / transfer",
    imgsrc: UVDTFtransfer,
  },
  {
    slug: "glitter-dtf",
    title: "Glitter DTF Transfers",
    subtitle: "Sparkle finish transfers",
    description: "The same durable DTF process with a shimmering glitter overlay for standout apparel and event merchandise.",
    applications: ["Event tees", "Dancewear", "Kids apparel", "Statement merch"],
    priceFrom: "$1.10 / transfer",
    imgsrc: GlitterDTFtransfer,
  },
  {
    slug: "sublimation",
    title: "Sublimation Printing",
    subtitle: "All-over dye printing",
    description: "Dye is infused directly into polyester fibers for edge-to-edge, fade-resistant color — ideal for jerseys and all-over prints.",
    applications: ["Team jerseys", "All-over apparel", "Mugs & metal panels", "Flags"],
    priceFrom: "$4.50 / sq ft",
    imgsrc: sublimationtransfer,
  },
];

export interface PromoProduct {
  slug: string;
  title: string;
  icon: LucideIcon;
  description: string;
  sizes: string[];
  materials: string[];
  features: string[];
  image: string;
}

export const PROMO_PRODUCTS: PromoProduct[] = [
  {
    slug: "business-cards",
    title: "Business Cards",
    icon: CreditCard,
    description: "Make the first handshake count with premium card stock and finishing options.",
    sizes: ['3.5" x 2" Standard', '2" x 2" Square', '3.5" x 2" Rounded Corner'],
    materials: ["16pt matte", "16pt soft-touch", "32pt triple-layer", "Foil accent"],
    features: ["Spot UV available", "Same-day proofing", "Free digital proof"],
    image: bussinesscards,
  },
  {
    slug: "stickers",
    title: "Stickers",
    icon: Tags,
    description: "Custom die-cut, kiss-cut and sheet stickers built for indoor or outdoor use.",
    sizes: ["Round", "Square", "Custom die-cut"],
    materials: ["No Laminate", "Gross Laminate"],
    features: ["Waterproof & UV resistant", "Any custom shape", "Bulk pricing tiers"],
    image: Sticker,
  },
  {
    slug: "banners",
    title: "Banners",
    icon: MonitorPlay,
    description: "Vinyl banners for storefronts, trade shows and events, built to survive the weather.",
    sizes: ["2' x 4'", "3' x 6'", "4' x 8'", "Custom size"],
    materials: ["13oz vinyl", "18oz heavy-duty vinyl", "Mesh (wind-through)"],
    features: ["Grommets every 2ft", "Hemmed edges", "Indoor/outdoor rated"],
    image: Banner,
  },
  {
    slug: "tents",
    title: "Tents",
    icon: Tent,
    description: "Pop-up event tents printed edge-to-edge with your brand for markets and expos.",
    sizes: ['10\' x 10"', '10\' x 15"', '10\' x 20"'],
    materials: ["600D polyester canopy", "Steel hex frame", "Aluminum frame (upgrade)"],
    features: ["Full-color dye sublimation", "Wheeled carry bag included", "Wind vents"],
    image: EventTent,
  },
  {
    slug: "magnets",
    title: "Magnets",
    icon: Magnet,
    description: "Car magnets and promo magnets that stay put and stay sharp.",
    sizes: ['12" x 18"', '12" x 24"', '3" x 3" promo'],
    materials: ["30mil car-grade magnet", "20mil promo magnet"],
    features: ["UV laminate finish", "Rounded corners standard", "Rust-resistant"],
    image: Magnetsticker,
  },
  {
    slug: "flags",
    title: "Flags",
    icon: Flag,
    description: "Feather and teardrop flags for storefronts, sports and outdoor events.",
    sizes: ["8ft feather flag", "11ft feather flag", "Teardrop banner"],
    materials: ["Knitted polyester", "Cross-base or ground stake"],
    features: ["Double-sided printing", "Fade-resistant ink", "Carry bag included"],
    image: flag,
  },
];

export const APPAREL_CATEGORIES = [
  { title: "T-Shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80" },
  { title: "Hoodies", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80" },
  { title: "Hats", image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80" },
  { title: "Polo Shirts", image: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&q=80" },
  { title: "Sweatshirts", image: "https://images.unsplash.com/photo-1614251056216-f748f76cd228?w=800&q=80" },
];

export const ART_SERVICES = [
  { value: "vector-conversion", label: "Vector Conversion" },
  { value: "digitizing", label: "Digitizing" },
  { value: "image-cleanup", label: "Image Cleanup" },
  { value: "artwork-recreation", label: "Artwork Recreation" },
];

export const ART_WORKFLOW = [
  { title: "Upload", description: "Send your artwork, logo or reference image." },
  { title: "Review", description: "Our art team checks resolution, colors & format." },
  { title: "Approval", description: "You approve the proof before it goes to press." },
  { title: "Production", description: "Your file is prepped and queued for printing." },
  { title: "Delivery", description: "Finished product ships or is ready for pickup." },
];

export const FAQ_GENERAL = [
  { q: "What file formats do you accept?", a: "We accept AI, EPS, SVG, PDF, PNG and JPG. Vector files (AI, EPS, SVG) give the sharpest results for logos and text." },
  { q: "How fast is turnaround?", a: "Most standard orders ship in 3–5 business days. Rush production is available at checkout for an added fee." },
  { q: "Do you offer proofs before printing?", a: "Yes — every order includes a free digital proof. Physical pre-production samples are available for large runs." },
  { q: "What's your minimum order quantity?", a: "Most products have no minimum. Bulk pricing tiers kick in automatically as your quantity grows." },
];
