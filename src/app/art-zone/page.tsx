import type { Metadata } from "next";
import { PageHero } from "../../components/sections/PageHero";
import { ART_WORKFLOW } from "../../data/site";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { Reveal } from "../../components/ui/Reveal";
import { ArtZoneForm } from "../../components/forms/ArtZoneForm";

export const metadata: Metadata = {
  title: "Art Zone — Artwork Upload, Vector Conversion & Digitizing",
  description: "Upload your artwork, logos or images and request vector conversion, digitizing, image cleanup or artwork recreation from our art team.",
  alternates: { canonical: "/art-zone" },
};

export default function ArtZone() {
  return (
    <>
      <PageHero
        eyebrow="Art Zone"
        title="Your artwork, prepped by real designers"
        description="Upload files, pick a service, and track your request from upload to delivery — no back-and-forth email threads required."
        crumbs={[{ label: "Art Zone" }]}
      />

      <section className="section-py container-px grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-display font-bold mb-6">Submit an artwork request</h2>
          <ArtZoneForm />
        </div>

        <div className="lg:col-span-2">
          <Reveal>
            <SectionHeading eyebrow="How it works" title="Request workflow" />
          </Reveal>
          <ol className="mt-8 relative border-l border-primary-100 pl-6 space-y-8">
            {ART_WORKFLOW.map((step, i) => (
              <Reveal delay={i * 0.05} key={step.title}>
                <li className="relative">
                  <span className="absolute -left-[31px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-accent-600 text-white text-xs font-bold">
                    {i + 1}
                  </span>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-primary-400 mt-1">{step.description}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
