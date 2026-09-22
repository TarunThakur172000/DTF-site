import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="container-px pt-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-primary-400">
        <li className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1 hover:text-accent-600">
            <Home size={14} /> Home
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <ChevronRight size={14} />
            {item.to ? (
              <Link href={item.to} className="hover:text-accent-600">{item.label}</Link>
            ) : (
              <span className="text-primary-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
