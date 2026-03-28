/*! coi-serviceworker v0.1.7 - Guido Zuidhof, licensed under MIT
    Fonte: https://github.com/gzuidhof/coi-serviceworker
    Injeta os headers COEP/COOP via Service Worker para habilitar
    SharedArrayBuffer e WASM no GitHub Pages e ambientes similares. */
"use strict";
(() => {
  if (typeof window === "undefined") {
    // Service Worker scope
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (e) =>
      e.waitUntil(self.clients.claim())
    );
    async function handleFetch(request) {
      if (request.cache === "only-if-cached" && request.mode !== "same-origin") {
        return;
      }
      const r = await fetch(request).catch((e) => console.error(e));
      if (!r) return;
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
    // Main thread: registra o service worker
    (async function () {
      if (!window.crossOriginIsolated) {
        if (!navigator.serviceWorker) {
          console.warn("[coi] Service workers não suportados neste navegador.");
          return;
        }
        try {
          await navigator.serviceWorker.register(
            window.coi_sw_path || "coi-serviceworker.js"
          );
          // Recarrega para ativar os novos headers
          if (!navigator.serviceWorker.controller) {
            window.location.reload();
          }
        } catch (e) {
          console.error("[coi] Falha ao registrar service worker:", e);
        }
      }
    })();
  }
})();
