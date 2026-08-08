import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "mr-mops.kg";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "Mr. Mops KG — зоомагазин в Бишкеке",
    description: "Корма, лакомства, игрушки, аксессуары и уход для кошек и собак. Доставка по Бишкеку и Кыргызстану.",
    icons: {
      icon: "/store/mrmops-logo.jpg",
      shortcut: "/store/mrmops-logo.jpg",
    },
    openGraph: {
      title: "Mr. Mops KG — всё для любимых питомцев",
      description: "Онлайн-заказ зоотоваров с доставкой по Бишкеку.",
      type: "website",
      locale: "ru_KG",
      url: origin,
      images: [{ url: `${origin}/og.png`, width: 1536, height: 1024, alt: "Mr. Mops KG — всё для любимых питомцев" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Mr. Mops KG — всё для любимых питомцев",
      description: "Онлайн-заказ зоотоваров с доставкой по Бишкеку.",
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
