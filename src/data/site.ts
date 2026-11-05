import { ProductType } from "@/components/product/PromotionalForm";
import type { LucideIcon } from "lucide-react";
import {
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
  target?: string;
  children?: NavChild[];
}

export const NAV: NavItem[] = [
  {
    label: "Promotional Products",
    to: "/promotional-products",
    children: [
      { label: "Business Cards", to: "/promotional-products/business-cards", target: "" },
      { label: "Stickers", to: "/promotional-products/stickers", target: "" },
      { label: "Banners", to: "/promotional-products/banners", target: "" },
      { label: "Tents", to: "/promotional-products/tents", target: "" },
      { label: "Magnets", to: "/promotional-products/magnets", target: "" },
      { label: "Flags", to: "/promotional-products/flags", target: "" },
    ],
  },
  { label: "Art Zone", to: "/art-zone" },
  { label: "Jerseys & Team Wear", to: "https://printpressrepeat.custombuilder.app/", target: "_blank" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export const WHY_US = [
  {
    title: "Quality That Gets Noticed",
    description:
      "Thoughtful materials and crisp printing help your brand make a polished first impression.",
    icon: Award,
  },
  {
    title: "Reliable Turnaround",
    description:
      "Keep campaigns, events, and customer orders moving with dependable production timelines.",
    icon: Clock3,
  },
  {
    title: "Options for Every Order",
    description:
      "Choose the quantities and product styles that fit your business and your goals.",
    icon: Package,
  },
  {
    title: "Helpful Product Support",
    description:
      "Get help selecting promotional products and preparing artwork for your order.",
    icon: Headset,
  },
  {
    title: "Built for Businesses",
    description:
      "From storefronts to trade shows, find branded products for the moments that matter.",
    icon: ShieldCheck,
  },
];

export const TESTIMONIALS = [
  {
    name: "Jessica Martinez",
    role: "Owner, Luna Market",
    quote:
      "Our business cards and branded stickers arrived looking sharp and made it easy to give every customer a polished experience.",
    rating: 5,
  },
  {
    name: "Michael Carter",
    role: "Owner, Carter Coffee Co.",
    quote:
      "The custom banners made our pop-up events feel like our own space. Ordering and proofing were straightforward.",
    rating: 5,
  },
  {
    name: "Ashley Nguyen",
    role: "Small Business Owner",
    quote:
      "The branded stickers look great on our packaging, and customers regularly ask where they can get one.",
    rating: 5,
  },
  {
    name: "David Wilson",
    role: "Event Coordinator, Elevate",
    quote:
      "Our event tent and flags helped guests find us quickly and gave the whole event a consistent branded look.",
    rating: 5,
  },
];

export const TRUSTED_BRANDS = [
  "Northside Rec League", "Chandran Studio", "Reyes Coffee Co.", "Fielding & Co.",
  "Maple & Vine", "Union Fitness", "Harbor Print Guild", "Cedarline Market",
];

export interface PromoProduct {
  type: ProductType;
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
    type: "business-cards",
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
    type: "stickers",
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
    type: "banners",
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
    type: "tents",
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
    type: "magnets",
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
    type: "flags",
    title: "Flags",
    icon: Flag,
    description: "Feather and teardrop flags for storefronts, sports and outdoor events.",
    sizes: ["8ft feather flag", "11ft feather flag", "Teardrop banner"],
    materials: ["Knitted polyester", "Cross-base or ground stake"],
    features: ["Double-sided printing", "Fade-resistant ink", "Carry bag included"],
    image: flag,
  },
];

export const ART_SERVICES = [
  { value: "vector-conversion", label: "Vector Conversion" },
  { value: "image-cleanup", label: "Image Cleanup" },
  { value: "artwork-recreation", label: "Artwork Recreation" },
  { value: "print-file-preparation", label: "Print File Preparation" },
];

export const ART_WORKFLOW = [
  { title: "Send your artwork", description: "Upload your logo, image, or existing design files." },
  { title: "Tell us what you need", description: "Choose an artwork service and describe your project." },
  { title: "Our team reviews it", description: "We review your files and follow up about the next steps." },
  { title: "Get print-ready artwork", description: "Receive artwork prepared for your promotional products." },
];

export const FAQ_GENERAL = [
  { q: "What file formats do you accept?", a: "We accept AI, EPS, SVG, PDF, PNG and JPG. Vector files (AI, EPS, SVG) give the sharpest results for logos and text." },
  { q: "How fast is turnaround?", a: "Most standard orders ship in 3–5 business days. Rush production is available at checkout for an added fee." },
  { q: "Do you offer proofs before printing?", a: "Yes — every order includes a free digital proof. Physical pre-production samples are available for large runs." },
  { q: "What's your minimum order quantity?", a: "Most products have no minimum. Bulk pricing tiers kick in automatically as your quantity grows." },
];
