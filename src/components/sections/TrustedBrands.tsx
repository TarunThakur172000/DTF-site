import { TRUSTED_BRANDS } from "../../data/site";

export function TrustedBrands() {
  return (
    <section className="py-12 border-y border-primary-50 overflow-hidden">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-primary-400 mb-6">
        Trusted by businesses across the country
      </p>
      <div className="relative flex overflow-hidden">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...TRUSTED_BRANDS, ...TRUSTED_BRANDS].map((brand, i) => (
            <span key={i} className="text-xl font-display font-semibold text-primary-100">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
