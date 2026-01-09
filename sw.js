self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // ❗ DO NOT intercept external websites
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response("", { status: 204 });
    })
  );
});
