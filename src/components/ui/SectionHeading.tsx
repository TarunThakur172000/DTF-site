import { Reveal } from "./Reveal";
import { Eyebrow } from "./Eyebrow";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
      {description && <p className="mt-4 text-primary-400 text-lg">{description}</p>}
    </Reveal>
  );
}
