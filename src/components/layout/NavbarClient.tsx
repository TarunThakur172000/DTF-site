"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, ShoppingCart, User } from "lucide-react";
import { NAV } from "../../data/site";
import { LinkButton } from "../ui/Button";
import { CartCount } from "./CartCount";
const logo = "/logo.webp";

interface NavbarClientProps {
  isLoggedIn: boolean;
}

export function NavbarClient({
  isLoggedIn,
}: NavbarClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(null);
  }, [pathname]);

  const navItems = [
    {
      label: "Shop",
      href: "/shop",
      hasMegaMenu: true,
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  const handleMegaToggle = (label: string) => {
    setMegaOpen((current) =>
      current === label ? null : label
    );
  };

  const handleMobileLink = () => {
    setMobileOpen(false);
    setMegaOpen(null);
  };

  return (
     <header
      className={`sticky top-0 z-50 transition-shadow duration-300 bg-black/90 backdrop-blur ${
        scrolled ? "shadow-soft" : ""
      }`}
    >
      <div className="container-px flex items-center justify-between h-20">
        <Link href="/" className="font-display font-bold text-xl text-primary-900 w-[5rem] h-auto">
          <img src={logo} alt="Logo" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {NAV.map((item) => {
            const isActive = pathname === item.to;
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setMegaOpen(item.label)}
                onMouseLeave={() => item.children && setMegaOpen(null)}
              >
                <Link
                  href={item.to}
                  className={`flex items-center px-3.5 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    isActive ? "text-accent-600" : "text-primary-50 hover:text-accent-600"
                  }`}
                >
                  {item.label}
                  {item.children && <ChevronDown size={14} />}
                </Link>

                <AnimatePresence>
                  {item.children && megaOpen === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full pt-2 w-72"
                    >
                      <div className="rounded-2xl bg-white shadow-lift border border-primary-50 p-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.to}
                            href={child.to}
                            target={child.target || undefined}
                            className="block rounded-xl px-4 py-2.5 hover:bg-surfaceMuted transition-colors duration-150"
                          >
                            <span className="block text-sm font-semibold text-primary-900">{child.label}</span>
                            {child.description && (
                              <span className="block text-xs text-primary-400 mt-0.5">{child.description}</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-1">
         <Link
  href="/cart"
  aria-label="View cart"
  className="relative flex items-center justify-center w-10 h-10 rounded-xl text-primary-50 hover:text-accent-600 hover:bg-white/5"
>
  <ShoppingCart size={19} />

  <CartCount />
</Link>
          {(! isLoggedIn) ? (
          <Link
            href="/login"
            aria-label="Sign in"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-primary-50 hover:text-accent-600 hover:bg-white/5"
          >
            
            <User size={19} /> 
         
          </Link>
          ):(
           <Link
            href="/dashboard"
            aria-label="Sign in"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-primary-50 hover:text-accent-600 hover:bg-white/5"
          >
            
            <User size={19} /> 
         
          </Link>
          )}
          <LinkButton to="/contact" size="md" className="ml-2">Contact Us</LinkButton>
        </div>

        <button
          className="lg:hidden p-2 text-primary-50"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t border-primary-50 bg-white"
          >
            <nav
              className="container-px py-4 flex flex-col gap-1 overflow-y-auto overscroll-contain pb-8"
              style={{ maxHeight: "calc(100dvh - 5rem)" }} // 5rem = h-20 of the header
              aria-label="Mobile"
            >
              {NAV.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.to}
                    className="block px-3 py-2.5 rounded-xl font-medium text-primary-900 hover:bg-surfaceMuted"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pl-4 flex flex-col">
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          href={child.to}
                          className="block px-3 py-2 rounded-xl text-sm text-primary-400 hover:text-accent-600"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-3 mt-4">
                <Link href="/cart" className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-primary-100 font-medium text-primary-900">
                  <ShoppingCart size={16} /> Cart
                </Link> 
                <Link href="/login" className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-primary-100 font-medium text-primary-900">
                  <User size={16} /> Sign In
                </Link>  
              </div>
                   
              <LinkButton to="/contact" className="mt-3 mb-8 justify-center">Contact Us</LinkButton>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}