import type { Metadata } from "next";
import { PageHero } from "../../components/sections/PageHero";
import { WHY_US } from "../../data/site";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { Reveal } from "../../components/ui/Reveal";
import { CtaBanner } from "../../components/sections/CtaBanner";

const aboutimg = "/images/aboutimg.webp";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "PrintCraft Co. is a custom print shop built for businesses, teams and creators who need reliable, premium print production.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About PrintCraft"
        title="A print shop run by people who print for a living"
        description="We started PrintCraft because too many print orders arrived late, faded, or nothing like the proof. We built the shop we wished existed."
        crumbs={[{ label: "About Us" }]}
      />

      <section className="section-py container-px grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <img
            src={aboutimg}
            alt="PrintCraft production floor"
            className="rounded-3xl shadow-lift w-full h-[420px] object-cover"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl font-display font-bold">From one DTF printer to a full production floor</h2>
          <p className="mt-5 text-primary-400 leading-relaxed">
            PrintCraft Co. opened with a single direct-to-film press and a handful of local
            customers who needed better turnaround than the big-box print chains could offer.
            Today our floor runs DTF, UV DTF, sublimation and embroidery lines side by side,
            supported by an in-house art team that preps every file before it hits production.
          </p>
          <p className="mt-4 text-primary-400 leading-relaxed">
            We still run every order the same way we ran our first: proof it, confirm it, print
            it right the first time.
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
