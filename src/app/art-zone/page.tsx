import type { Metadata } from "next";
import { ART_WORKFLOW } from "../../data/site";
import { ArtZoneForm } from "../../components/forms/ArtZoneForm";
import { PageHero } from "../../components/sections/PageHero";
import { Reveal } from "../../components/ui/Reveal";
import { SectionHeading } from "../../components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Art Zone — Artwork Services",
  description:
    "Get help preparing artwork for promotional products. Request vector conversion, image cleanup, artwork recreation, and print file preparation.",
  alternates: { canonical: "/art-zone" },
};

export default function ArtZonePage() {
  return (
    <>
      <PageHero
        eyebrow="Art Zone"
        title="Artwork help for your next big idea"
        description="Our art team can help prepare your logo and designs for business cards, stickers, banners, and other promotional products."
        crumbs={[{ label: "Art Zone" }]}
      />

      <section className="section-py container-px grid items-start gap-12 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SectionHeading
            eyebrow="Get started"
            title="Tell us about your artwork"
            description="Choose a service, share a few details, and upload your files so our team can review your request."
          />
          <ArtZoneForm />
        </div>

        <div className="lg:col-span-2">
          <Reveal>
            <SectionHeading eyebrow="What to expect" title="A clear path from file to print" />
          </Reveal>
          <ol className="relative mt-8 space-y-8 border-l border-primary-100 pl-6">
            {ART_WORKFLOW.map((step, index) => (
              <Reveal delay={index * 0.05} key={step.title}>
                <li className="relative">
                  <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-accent-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-primary-400">{step.description}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
