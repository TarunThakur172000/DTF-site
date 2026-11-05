This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## WooCommerce checkout

The app creates WooCommerce orders through the standard WooCommerce REST API. Online payment gateways send customers to the WooCommerce order-payment page; Cash on Delivery (COD) places the order directly and shows payment due on delivery, without reporting the order as paid. Enabled payment methods are read from WooCommerce and revalidated on the server when an order is created. The app does not collect or store card details and does not use the custom MyStore cart endpoint.

Configure these server-only environment variables:

- `WOOCOMMERCE_BASE_URL`: the HTTPS base URL of the WooCommerce site (for example, `https://store.example.com`).
- `WOOCOMMERCE_CONSUMER_KEY` and `WOOCOMMERCE_CONSUMER_SECRET`: a WooCommerce REST API key with read/write access. Keep both out of browser code and source control.
- `WORDPRESS_USERNAME` and `WORDPRESS_APP_PASSWORD`: a dedicated WordPress account and application password with media upload permission. Keep both server-side and out of source control.
- `WOOCOMMERCE_WEBHOOK_SECRET`: a strong secret shared with the order webhook configured below.
- `MONGODB_URI`: the existing application database connection.

In WooCommerce, enable and configure the payment gateways customers should use. Create WooCommerce webhooks for **Order created** and **Order updated** that point to:

```text
https://<your-app-host>/api/webhooks/woocommerce/order
```

Set the webhook secret to the same value as `WOOCOMMERCE_WEBHOOK_SECRET`. The app confirms payment only from a signature-verified webhook; a browser redirect or query parameter alone never marks an order paid. Payment status is scoped to the logged-in account or the browser's HttpOnly guest-cart cookie. Guest orders are allowed.

The checkout sends product IDs and quantities from the server-owned cart to WooCommerce, which calculates order prices, taxes, and shipping. Customization fields are attached as order-item metadata. Before creating an order, uploaded artwork files are uploaded to the WordPress Media Library and their URLs are attached to the corresponding WooCommerce order items. Configure `WORDPRESS_USERNAME` and `WORDPRESS_APP_PASSWORD` as server-only variables; use a dedicated WordPress account with media upload permission and an application password. Deploy the updated `wordpress/mystore-checkout-handoff.php` plugin if the store must accept AI, EPS, or TIFF uploads. WordPress media URLs are normally public, so use protected media storage if artwork must remain private.

Test with the payment gateway's sandbox/test mode before enabling live payments. A checkout will not complete if no WooCommerce payment gateway is enabled, the REST key lacks permission, or the signed webhook is not configured.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
