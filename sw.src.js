importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js');

workbox.setConfig({ debug: true });

workbox.skipWaiting();
workbox.clientsClaim();

const backgroundSyncPlugin = new workbox.backgroundSync.Plugin('apiRequestQueue', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours
});

workbox.routing.registerRoute(
  /.*\.(?:js|html|css)/,
  workbox.strategies.cacheFirst({cacheName: workbox.core.cacheNames.precache})
);

workbox.routing.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  workbox.strategies.staleWhileRevalidate({cacheName: 'googleapi-cache'})
);

workbox.routing.registerRoute(
  /.*\.(?:png|jpe?g|svg|gif)/,
  workbox.strategies.cacheFirst({cacheName: 'img-cache'})
);

workbox.routing.registerNavigationRoute('/index.html');

workbox.precaching.precacheAndRoute([]);
