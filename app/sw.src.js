workbox.setConfig({ debug: true });

workbox.skipWaiting();
workbox.clientsClaim();

workbox.routing.registerRoute(
  /(js|css|index|restaurant).*\.(?:js|html|css)/,
  workbox.strategies.staleWhileRevalidate({cacheName: workbox.core.cacheNames.precache})
);

workbox.routing.registerRoute(
  /.*-(200|500|800)\.jpg$/,
  workbox.strategies.staleWhileRevalidate({cacheName: 'rest-img-cache'})
);

workbox.routing.registerRoute(
  /.*maps\.googleapis\.com\/maps\/api\/staticmap.*$/,
  workbox.strategies.staleWhileRevalidate({
    cacheableResponse: {statuses: [0, 200]},
    cacheName: 'google-maps-static',
    cacheExpiration: {
      maxEntries: 10
    }
  })
);

workbox.routing.registerRoute(
  /.*maps\.googleapis\.com\/maps\/api\/js.*$/,
  workbox.strategies.staleWhileRevalidate({
    cacheableResponse: {statuses: [0, 200]},
    cacheName: 'googleapi-js-cache',
    cacheExpiration: {
      maxEntries: 30
    }
  })
);

workbox.routing.registerRoute(
  /.*maps\.googleapis\.com\/maps\/vt.*$/,
  workbox.strategies.staleWhileRevalidate({
    cacheableResponse: {statuses: [0, 200]},
    cacheName: 'googleapi-tiles-cache',
    cacheExpiration: {
      maxEntries: 30
    }
  })
);

workbox.routing.registerRoute(
  /.*maps\.googleapis\.com\/maps-api-.*(?<!stats\.js)$/,
  workbox.strategies.staleWhileRevalidate({
    cacheableResponse: {statuses: [0, 200]},
    cacheName: 'googleapi-app-js-cache',
    cacheExpiration: {
      maxEntries: 30
    }
  })
);

workbox.routing.registerRoute(
  /.*maps\.gstatic\.com\/mapfiles.*$/,
  workbox.strategies.staleWhileRevalidate({
    cacheableResponse: {statuses: [0, 200]},
    cacheName: 'googleapi-static-cache',
    cacheExpiration: {
      maxEntries: 30
    }
  })
);

workbox.routing.registerRoute(
  /.*maps\.googleapis\.com\/mapfiles.*$/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'googleapi-img-cache',
    cacheExpiration: {
      maxEntries: 30
    }
  })
);

workbox.routing.registerRoute(
  /.*fonts\.googleapis\.com\/css.*$/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'googleapi-fonts-cache',
    cacheExpiration: {
      maxEntries: 30
    }
  })
);

workbox.routing.registerRoute(
  /.*mws-stage-2-.*\.now\.sh\/restaurants$/,
  workbox.strategies.staleWhileRevalidate({cacheName: 'api-server'})
);

workbox.precaching.precacheAndRoute(self.__precacheManifest);
