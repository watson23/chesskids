const CACHE_NAME = "mfcm-v2";

// App shell: critical assets precached on install for offline support
const PRECACHE_URLS = [
  "/",
  "/manifest.json",

  // Backgrounds
  "/journey-map-bg.webp",
  "/game-bg.webp",
  "/play-bg.webp",
  "/practice-bg.webp",

  // UI icons (all)
  "/icons/icon-add-player.webp",
  "/icons/icon-back.webp",
  "/icons/icon-caret-right.webp",
  "/icons/icon-character.webp",
  "/icons/icon-check-circle.webp",
  "/icons/icon-check.webp",
  "/icons/icon-chest-closed-left-side.webp",
  "/icons/icon-chest-closed-right-side.webp",
  "/icons/icon-chest-open-left-side.webp",
  "/icons/icon-chest-open-right-side.webp",
  "/icons/icon-close.webp",
  "/icons/icon-home.webp",
  "/icons/icon-lock.webp",
  "/icons/icon-next.webp",
  "/icons/icon-play.webp",
  "/icons/icon-practice.webp",
  "/icons/icon-retry.webp",
  "/icons/icon-settings.webp",
  "/icons/icon-sign-out.webp",
  "/icons/icon-sound-off.webp",
  "/icons/icon-sound-on.webp",
  "/icons/icon-star-empty.webp",
  "/icons/icon-star-full.webp",

  // Mascot (webp versions)
  "/mascot/piku-happy.webp",
  "/mascot/piku-celebrating.webp",
  "/mascot/piku-thinking.webp",
  "/mascot/piku-winking.webp",
  "/mascot/piku-sad.webp",
  "/mascot/piku-cheering.webp",
  "/mascot/piku-determined.webp",
  "/mascot/piku-proud.webp",
  "/mascot/piku-puzzled.webp",
  "/mascot/piku-sleepy.webp",
  "/mascot/piku-surprised.webp",
  "/mascot/piku-waist-up.webp",
  // PNG fallbacks (expressions without webp yet)
  "/mascot/piku-teaching.png",
  "/mascot/piku-holding-pawn.png",
  "/mascot/piku-wrong.png",
  "/mascot/piku-wave.png",

  // Opponents
  "/opponents/mouse-t.webp",
  "/opponents/fox-t.webp",
  "/opponents/owl-t.webp",
  "/opponents/bear-t.webp",

  // Sounds
  "/sounds/tap.mp3",
  "/sounds/place.mp3",
  "/sounds/pickup.mp3",
  "/sounds/bonk.mp3",
  "/sounds/complete.mp3",
  "/sounds/confetti.mp3",
  "/sounds/sparkle.mp3",
  "/sounds/chest.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Firebase/Google APIs: always network, never cache
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("identitytoolkit.googleapis.com") ||
    url.hostname.includes("securetoken.googleapis.com") ||
    url.hostname.includes("accounts.google.com") ||
    url.hostname.includes("googleapis.com")
  ) {
    return;
  }

  // Navigation: network-first with cache fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful navigations for offline
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match("/").then((r) => r || new Response("Offline")))
    );
    return;
  }

  // Assets: cache-first with network fallback + background revalidation
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
      return cached || fetchPromise;
    })
  );
});
