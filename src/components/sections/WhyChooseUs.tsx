import { WHY_US } from "../../data/site";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

export function WhyChooseUs() {
  return (
    <section className="section-py bg-surfaceMuted">
      <div className="container-px">
        <SectionHeading eyebrow="Why Businesses Choose Us" title="Your Trusted Partner for Quality Printing" align="center" />
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
  );
}
