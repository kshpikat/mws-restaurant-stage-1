importScripts("precache-manifest.96d1da45730a52bf254302b36dd4de0b.js", "https://storage.googleapis.com/workbox-cdn/releases/3.4.1/workbox-sw.js");

workbox.setConfig({ debug: true });

workbox.routing.registerRoute(
  /(index|restaurant)\.(html).*/,
  workbox.strategies.staleWhileRevalidate({cacheName: workbox.core.cacheNames.precache})
);
workbox.routing.registerRoute(
  /(js|css).*\.(?:js|css)/,
  workbox.strategies.staleWhileRevalidate({cacheName: workbox.core.cacheNames.precache})
);
workbox.routing.registerRoute(
  /.*-(200|500|800)\.jpg$/,
  workbox.strategies.staleWhileRevalidate({cacheName: workbox.core.cacheNames.precache})
);

const reviewBgSyncPlugin = new workbox.backgroundSync.Plugin('reviews', {
  maxRetentionTime: 24 * 60,
  callbacks: {
    queueDidReplay: () => {
      self.clients.matchAll()
        .then((clients) => {
          clients.forEach(client => client.postMessage("reviews-done"));
        });
    }
  }
});
const reviewURL = new RegExp(/\/reviews\//i);
workbox.routing.registerRoute(
  ({url}) => {
    console.info(url);
    console.info(reviewURL.test(url.pathname));
    return reviewURL.test(url.pathname);
  },
  workbox.strategies.networkOnly({
    plugins: [reviewBgSyncPlugin]
  }),
  'POST'
);

const favBgSyncPlugin = new workbox.backgroundSync.Plugin('favorites', {
  maxRetentionTime: 24 * 60,
  callbacks: {
    queueDidReplay: () => {
      self.clients.matchAll()
        .then((clients) => {
          clients.forEach(client => client.postMessage("favorite-done"));
        });
    }
  }
});

const favURL = new RegExp(/\/restaurants\/\d+\//i);
workbox.routing.registerRoute(
  ({url}) => {
    console.info(url);
    console.info(favURL.test(url.pathname));
    return favURL.test(url.pathname);
  },
  workbox.strategies.networkOnly({
    plugins: [favBgSyncPlugin]
  }),
  'PUT'
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
   /.+maps\.googleapis\.com\/maps-api-v3\/api\/js\/[^\/]+\/[^\/]+\/(?!stats\.js).+/,
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

workbox.skipWaiting();
workbox.clientsClaim();

workbox.precaching.precacheAndRoute(self.__precacheManifest);


