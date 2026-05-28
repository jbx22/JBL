const CACHE = "agd-law-ai-v1";
const STATIC_FILES = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(STATIC_FILES).catch(() => {
        // Static files that may not exist yet are skipped gracefully
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-http(s) requests
  if (request.method !== "GET" || !url.protocol.startsWith("http")) return;

  // API requests: network-first with timeout fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithTimeout(request, 5000));
    return;
  }

  // Static assets: cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2?|css|js)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Pages: network-first, fallback to cache
  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // For navigation requests, serve the cached root page
    if (request.mode === "navigate") {
      const root = await caches.match("/");
      if (root) return root;
    }
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirstWithTimeout(request, timeoutMs) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), timeoutMs)
  );
  try {
    const response = await Promise.race([fetch(request), timeoutPromise]);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
