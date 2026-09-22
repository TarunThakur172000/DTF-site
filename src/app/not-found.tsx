import { LinkButton } from "../components/ui/Button";

export default function NotFound() {
  return (
    <section className="container-px section-py text-center">
      <p className="eyebrow justify-center">404</p>
      <h1 className="mt-4 text-4xl font-bold">We couldn&apos;t find that page</h1>
      <p className="mt-4 text-primary-400 max-w-md mx-auto">
        The page may have moved or the link is out of date. Head back home or browse our products.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <LinkButton to="/">Back to Home</LinkButton>
        <LinkButton to="/promotional-products" variant="secondary">Browse Products</LinkButton>
      </div>
    </section>
  );
}
