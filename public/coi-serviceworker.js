"use strict";
(() => {
  if (typeof window === "undefined") {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

    async function handleFetch(request) {
      if (request.cache === "only-if-cached" && request.mode !== "same-origin") return;
      let r;
      try {
        r = await fetch(request);
      } catch (e) {
        return;
      }
      // Não tenta construir Response com status inválido (ex: 0 de requisições bloqueadas)
      if (!r || r.status === 0) return r;
      const newHeaders = new Headers(r.headers);
      newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
      newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
      newHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");
      return new Response(r.body, {
        status: r.status,
        statusText: r.statusText,
        headers: newHeaders,
      });
    }
    self.addEventListener("fetch", (e) => e.respondWith(handleFetch(e.request)));
  } else {
    (async function () {
      if (!window.crossOriginIsolated && navigator.serviceWorker) {
        try {
          await navigator.serviceWorker.register("/ifc-viewer/coi-serviceworker.js");
          if (!navigator.serviceWorker.controller) window.location.reload();
        } catch (e) {
          console.error("[coi] Falha ao registrar service worker:", e);
        }
      }
    })();
  }
})();
