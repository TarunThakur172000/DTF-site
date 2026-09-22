import Link from "next/link";
import { Camera, Users, MessageCircle } from "lucide-react";
import { Newsletter } from "./Newsletter";

const logo = "/logo.webp";

const quickLinks = [
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Art Zone", to: "/art-zone" },
  { label: "Jerseys & Team Wear", to: "/jerseys" },
];

const serviceLinks = [
  { label: "Transfer Printing", to: "/transfer-printing" },
  { label: "Promotional Products", to: "/promotional-products" },
  { label: "Custom Apparel", to: "/custom-apparel" },
  { label: "Random Products", to: "/random-products" },
];

export function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-px section-py grid gap-12 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg text-white">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10">
              <img src={logo} alt="PrintPressRepeat logo" />
            </span>
            PrintPressRepeat
          </Link>
          <p className="mt-4 text-sm text-primary-400 max-w-xs">
            Custom printing for businesses, teams and creators — from first proof to final delivery.
          </p>
          <div className="flex gap-3 mt-5">
            {[Camera, Users, MessageCircle].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social media link"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 hover:bg-accent-600 transition-colors duration-150"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display font-semibold">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-400">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className="hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-400">
            {serviceLinks.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className="hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <Newsletter />
      </div>

      <div className="border-t border-white/10">
        <div className="container-px py-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-primary-400">
          <p>&copy; {new Date().getFullYear()} PrintPressRepeat Co. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
