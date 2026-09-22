import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HOME_SERVICES } from "../../data/site";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

export function ServicesGrid() {
  return (
    <section className="section-py container-px">
      <SectionHeading eyebrow="Everything You Need to Print" title="One Trusted Partner for All Your Printing Needs" description="Whether you're building a clothing brand, promoting your business, or fulfilling customer orders, we provide high-quality printing solutions designed to help you create products with confidence." />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {HOME_SERVICES.map((service, i) => (
          <Reveal delay={i * 0.06} key={service.title}>
            <Link
              href={service.to}
              className="group block h-full rounded-2xl border border-primary-50 bg-white p-7 shadow-card hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-50 text-accent-600">
                  <service.icon size={22} />
                </span>
                <ArrowUpRight className="text-primary-100 group-hover:text-accent-600 transition-colors" size={20} />
              </div>
              <h3 className="mt-5 font-display font-semibold text-lg">{service.title}</h3>
              <p className="mt-2 text-sm text-primary-400 leading-relaxed">{service.description}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
