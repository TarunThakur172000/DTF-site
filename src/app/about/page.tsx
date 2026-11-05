import type { Metadata } from "next";
import { PageHero } from "../../components/sections/PageHero";
import { WHY_US } from "../../data/site";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { Reveal } from "../../components/ui/Reveal";
import { CtaBanner } from "../../components/sections/CtaBanner";

const aboutimg = "/images/bussinessCard.webp";

export const metadata: Metadata = {
  title: "About PrintPressRepeat",
  description:
    "PrintPressRepeat helps businesses make their mark with quality promotional products and dependable print production.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About PrintPressRepeat"
        title="Promotional products made to represent your brand"
        description="We help businesses turn their brand into useful, memorable products for customers, teams, and events."
        crumbs={[{ label: "About Us" }]}
      />

      <section className="section-py container-px grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <img
            src={aboutimg}
            alt="Custom printed business cards"
            className="rounded-3xl shadow-lift w-full h-[420px] object-cover"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl font-display font-bold">Your brand, ready to go places</h2>
          <p className="mt-5 text-primary-400 leading-relaxed">
            PrintPressRepeat helps businesses bring their branding to life across business
            cards, stickers, banners, event tents, magnets, and flags. We focus on clear
            product options, dependable production, and artwork support from proof to delivery.
          </p>
          <p className="mt-4 text-primary-400 leading-relaxed">
            Every order is reviewed carefully so your promotional products arrive ready to
            represent your business.
          </p>
        </Reveal>
      </section>

      <section className="section-py bg-surfaceMuted">
        <div className="container-px">
          <SectionHeading eyebrow="What we stand for" title="Why customers stick with us" align="center" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {WHY_US.map((item, i) => (
              <Reveal delay={i * 0.05} key={item.title} className="text-center">
                <span className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-card text-accent-600">
                  <item.icon size={24} />
                </span>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-primary-400 leading-relaxed">{item.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
