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
    title: "Линия роста — интернет-магазины для бизнеса",
    description: "Интернет-магазины под бренд компании: каталог, корзина, Telegram-заказы, оплата и автоматизация. Запуск от 7 дней.",
    openGraph: {
      title: "Линия роста — интернет-магазины для бизнеса",
      description: "Создаём магазины, которые принимают заявки 24/7. Запуск от 7 дней.",
      type: "website",
      locale: "ru_KG",
      url: origin,
      images: [{ url: `${origin}/og.png`, width: 1536, height: 1024, alt: "Линия роста — интернет-магазины для бизнеса" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Линия роста — интернет-магазины для бизнеса",
      description: "Создаём магазины, которые принимают заявки 24/7. Запуск от 7 дней.",
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
