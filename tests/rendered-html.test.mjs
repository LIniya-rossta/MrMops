import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(workerUrl.href)).default;
}

const env = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};

const ctx = {
  waitUntil() {},
  passThroughOnException() {},
};

test("server renders the pet store", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    env,
    ctx,
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Лапа Маркет/i);
  assert.match(html, /ВСЁ ДЛЯ/);
  assert.match(html, /Корзина/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("order endpoint rejects an empty cart", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/api/order", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    }),
    env,
    ctx,
  );

  assert.equal(response.status, 400);
  const result = await response.json();
  assert.equal(result.ok, false);
  assert.match(result.error, /имя|телефон|адрес/i);
});

test("static build contains the pet-store metadata", async () => {
  const html = await readFile(new URL("../docs/index.html", import.meta.url), "utf8");
  assert.match(html, /Лапа Маркет/);
  assert.match(html, /зоотовары/i);
  assert.match(html, /og\.png/);
});
