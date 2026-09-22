import type { Metadata, Viewport } from "next";
import { Sora, Inter } from "next/font/google";
import { Layout } from "../components/layout/Layout";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.printpressrepeat.com"),
  title: {
    default: "PrintPressRepeat | Custom DTF Transfers & Promotional Printing",
    template: "%s | PrintPressRepeat",
  },
  description:
    "Premium DTF, UV DTF, glitter and sublimation transfers, custom apparel, and promotional products — no minimums, fast turnaround, dependable service.",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
