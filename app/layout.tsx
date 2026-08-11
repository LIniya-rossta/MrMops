import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "liniya-rossta.github.io";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "Лапа Маркет — зоотовары с доставкой по Бишкеку",
    description: "Корма, лакомства, игрушки и уход для кошек, собак и других питомцев. Удобный заказ с доставкой по Бишкеку.",
    openGraph: {
      title: "Лапа Маркет — всё для счастливых лапок",
      description: "Зоотовары с удобным заказом и доставкой по Бишкеку.",
      type: "website",
      locale: "ru_KG",
      url: origin,
      images: [{ url: `${origin}/og.png`, width: 1536, height: 1024, alt: "Лапа Маркет — зоотовары с доставкой" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Лапа Маркет — всё для счастливых лапок",
      description: "Зоотовары с удобным заказом и доставкой по Бишкеку.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
