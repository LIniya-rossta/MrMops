/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { serviceCatalog } from "../store.config";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/order") {
      if (request.method === "OPTIONS") return corsPreflight(request);
      return withCors(await handleOrder(request, env), request);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;

type OrderBody = {
  name?: unknown;
  phone?: unknown;
  delivery?: unknown;
  address?: unknown;
  payment?: unknown;
  comment?: unknown;
  website?: unknown;
  startedAt?: unknown;
  items?: unknown;
};

async function handleOrder(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return json({ ok: false, error: "Метод не поддерживается" }, 405);
  if ((Number(request.headers.get("content-length")) || 0) > 20_000) return json({ ok: false, error: "Слишком большой заказ" }, 413);

  let body: OrderBody;
  try {
    body = await request.json() as OrderBody;
  } catch {
    return json({ ok: false, error: "Проверьте данные заказа" }, 400);
  }

  if (text(body.website, 200)) return json({ ok: true, orderId: "accepted" });
  if (typeof body.startedAt === "number" && Date.now() - body.startedAt < 900) return json({ ok: false, error: "Попробуйте отправить заказ ещё раз" }, 429);

  const name = text(body.name, 80);
  const phone = text(body.phone, 30);
  const delivery = text(body.delivery, 80);
  const address = text(body.address, 180);
  const payment = text(body.payment, 80);
  const comment = text(body.comment, 500);
  if (!name || phone.length < 7 || !address || !delivery) return json({ ok: false, error: "Заполните имя, телефон и компанию или сферу" }, 400);
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) return json({ ok: false, error: "Корзина пуста" }, 400);

  const lines: { name: string; price: number; quantity: number }[] = [];
  for (const raw of body.items) {
    if (!raw || typeof raw !== "object") continue;
    const id = text((raw as { id?: unknown }).id, 80);
    const quantity = Math.min(20, Math.max(1, Math.floor(Number((raw as { quantity?: unknown }).quantity) || 0)));
    const product = serviceCatalog[id];
    if (product) lines.push({ ...product, quantity });
  }
  if (!lines.length) return json({ ok: false, error: "Товары в корзине не найдены" }, 400);

  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return json({ ok: false, error: "Канал заявок временно недоступен. Попробуйте ещё раз позже" }, 503);
  const orderId = `${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const itemText = lines.map((line, index) => `${index + 1}. ${line.name}\n   ${line.quantity} × ${line.price} = ${line.quantity * line.price} сом`).join("\n");
  const message = [
    `🚀 НОВАЯ ЗАЯВКА #${orderId}`,
    "",
    itemText,
    "",
    `Предварительно: от ${total} сом`,
    "Точная смета после уточнения задач",
    "",
    `👤 ${name}`,
    `📞 ${phone}`,
    `🧩 ${delivery}`,
    `🏢 ${address}`,
    `💰 ${payment || "Нужно рассчитать"}`,
    comment ? `💬 ${comment}` : "",
  ].filter(Boolean).join("\n");

  try {
    const chatId = env.TELEGRAM_CHAT_ID?.trim() || await findLatestChatId(token);
    if (!chatId) return json({ ok: false, error: "Сначала напишите боту /start, затем повторите заказ" }, 503);
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
    const telegramResult = await telegramResponse.json() as { ok?: boolean; description?: string };
    if (!telegramResponse.ok || !telegramResult.ok) throw new Error(telegramResult.description || "Telegram rejected the order");
    return json({ ok: true, orderId });
  } catch (error) {
    console.error("Order delivery failed", error instanceof Error ? error.message : "Unknown error");
    return json({ ok: false, error: "Не удалось отправить заявку. Попробуйте ещё раз позже" }, 502);
  }
}

async function findLatestChatId(token: string): Promise<string> {
  const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100&timeout=0`);
  if (!response.ok) return "";
  const data = await response.json() as { result?: Array<{ message?: { chat?: { id?: number } }; channel_post?: { chat?: { id?: number } } }> };
  for (const update of [...(data.result ?? [])].reverse()) {
    const id = update.message?.chat?.id ?? update.channel_post?.chat?.id;
    if (id) return String(id);
  }
  return "";
}

function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

const allowedOrderOrigins = new Set([
  "https://liniya-rossta.github.io",
  "http://localhost:3000",
]);

function allowedOrigin(request: Request): string {
  const origin = request.headers.get("origin") || "";
  return allowedOrderOrigins.has(origin.toLowerCase()) ? origin : "";
}

function corsPreflight(request: Request): Response {
  const origin = allowedOrigin(request);
  if (!origin) return new Response(null, { status: 403 });
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
      "vary": "Origin",
    },
  });
}

function withCors(response: Response, request: Request): Response {
  const origin = allowedOrigin(request);
  if (!origin) return response;
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", origin);
  headers.set("vary", "Origin");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
