import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { PageHero } from "../../components/sections/PageHero";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { Reveal } from "../../components/ui/Reveal";
import { FaqAccordion } from "../../components/ui/FaqAccordion";
import { FAQ_GENERAL } from "../../data/site";
import { ContactForm } from "../../components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with PrintCraft Co. for quotes, order questions or general support.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about your project"
        description="Questions about pricing, timelines, or file specs? Reach out and a real person on our team will follow up."
        crumbs={[{ label: "Contact" }]}
      />

      <section className="section-py container-px grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <ContactForm />

          <div className="mt-16">
            <SectionHeading eyebrow="Common questions" title="Support FAQ" />
            <div className="mt-8">
              <FaqAccordion items={FAQ_GENERAL} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Reveal>
            <div className="rounded-2xl border border-primary-50 bg-white p-6 shadow-card space-y-5">
              <InfoRow icon={Phone} label="Phone" value="(555) 210-4488" />
              <InfoRow icon={Mail} label="Email" value="hello@printcraft.example.com" />
              <InfoRow icon={MapPin} label="Studio" value="482 Fulton Ave, Denver, CO 80204" />
              <InfoRow icon={Clock} label="Hours" value="Mon–Fri, 8am–6pm MT" />
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="rounded-2xl overflow-hidden shadow-card border border-primary-50 h-64">
              <iframe
                title="PrintCraft studio location map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-105.03%2C39.72%2C-104.95%2C39.77&layer=mapnik"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-50 text-accent-600 shrink-0">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs text-primary-400">{label}</p>
        <p className="font-medium text-primary-900">{value}</p>
      </div>
    </div>
  );
}
