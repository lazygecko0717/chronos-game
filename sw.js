const CACHE_NAME = 'chronos-v0-2-11';
const APP_FILES = ['./', './index.html', './manifest.webmanifest', './assets/home/app-icon-192.png', './assets/home/app-icon-512.png', './assets/home/apple-touch-icon.png', './assets/home/home-background.webp', './assets/home/home-logo.png', './assets/player-area-bg.webp', "./assets/roles/chronos.png", "./assets/roles/oracle.png", "./assets/roles/time-knight.png", "./assets/roles/chrono-guard.png", "./assets/roles/eternal-herald.png", "./assets/roles/fate-assassin.png", "./assets/roles/void-lord.png", "./assets/roles/hidden-one.png", "./assets/roles/lone-wanderer.png", "./assets/roles/time-raider.png", "./assets/roles/chaos-walker.png", "./assets/cards/card-back.png", "./assets/cards/guardian-frame.png", "./assets/cards/rebel-frame.png", "./assets/cards/mission-success.png", "./assets/cards/mission-failure.png", "./assets/cards/vote-approve.png", "./assets/cards/vote-reject.png"];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key.startsWith('chronos-') && key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

  // Always check the network first for page navigations so GitHub Pages updates
  // are not hidden behind an old cached homepage.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./', copy));
        }
        return response;
      }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
