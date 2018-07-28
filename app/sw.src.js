workbox.setConfig({ debug: true });

workbox.skipWaiting();
workbox.clientsClaim();

workbox.routing.registerRoute(
  /.*\.(?:js|html|css|json)/,
  workbox.strategies.cacheFirst({cacheName: workbox.core.cacheNames.precache})
);

workbox.routing.registerRoute(
  /.*maps\.googleapis\.com\/maps\/api\/staticmap.*$/,
  workbox.strategies.cacheFirst({cacheName: 'google-maps-static'})
);

workbox.routing.registerRoute(
  /.*maps\.googleapis\.com\/maps\/api\/staticmap.*$/,
  workbox.strategies.cacheFirst({cacheName: 'google-maps-static'})
);

workbox.routing.registerRoute(
  /.*mws-stage-2-.*\.now\.sh\/restaurants$/,
  workbox.strategies.staleWhileRevalidate({cacheName: 'api-server'})
);

workbox.routing.registerRoute(
  /.*\.(?:png|jpe?g|svg|gif)/,
  workbox.strategies.cacheFirst({cacheName: 'img-cache'})
);

workbox.routing.registerNavigationRoute('/index.html');

workbox.precaching.precacheAndRoute(self.__precacheManifest);
