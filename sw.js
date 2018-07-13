importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.4.1/workbox-sw.js");

workbox.setConfig({ debug: false });

workbox.skipWaiting();
workbox.clientsClaim();

workbox.routing.registerRoute(
  /.*\.html\?.*/,
  workbox.strategies.staleWhileRevalidate({cacheName: workbox.core.cacheNames.precache})
);

workbox.routing.registerRoute(
  /.*\.(?:js|html|css)/,
  workbox.strategies.staleWhileRevalidate({cacheName: workbox.core.cacheNames.precache})
);

workbox.routing.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  workbox.strategies.staleWhileRevalidate({cacheName: 'googleapi-cache'})
);

workbox.routing.registerRoute(
  /.*\.(?:png|jpe?g|svg|gif)/,
  workbox.strategies.staleWhileRevalidate({cacheName: 'img-cache'})
);

workbox.routing.registerNavigationRoute('/index.html');

self.__precacheManifest = [
  {
    "url": "css/styles.css",
    "revision": "153c33ee614fe3f2a49fa18d4c5b9e13"
  },
  {
    "url": "data/restaurants.json",
    "revision": "500a3defff288a163f63f80b48025716"
  },
  {
    "url": "img/1.jpg",
    "revision": "cc074688becddd2725114187fba9471c"
  },
  {
    "url": "img/10.jpg",
    "revision": "2bd68efbe70c926de6609946e359faa2"
  },
  {
    "url": "img/2.jpg",
    "revision": "759b34e9a95647fbea0933207f8fc401"
  },
  {
    "url": "img/3.jpg",
    "revision": "81ee36a32bcfeea00db09f9e08d56cd8"
  },
  {
    "url": "img/4.jpg",
    "revision": "23f21d5c53cbd8b0fb2a37af79d0d37f"
  },
  {
    "url": "img/5.jpg",
    "revision": "0a166f0f4e10c36882f97327b3835aec"
  },
  {
    "url": "img/6.jpg",
    "revision": "eaf1fec4ee66e121cadc608435fec72f"
  },
  {
    "url": "img/7.jpg",
    "revision": "bd0ac197c58cf9853dc49b6d1d7581cd"
  },
  {
    "url": "img/8.jpg",
    "revision": "6e0e6fb335ba49a4a732591f79000bb4"
  },
  {
    "url": "img/9.jpg",
    "revision": "ba4260dee2806745957f4ac41a20fa72"
  },
  {
    "url": "img/icons/icon-128x128.png",
    "revision": "36f314f6cdd46d38e648cad9bc797d97"
  },
  {
    "url": "img/icons/icon-144x144.png",
    "revision": "eecd8ce226df99356f7deec344c9de74"
  },
  {
    "url": "img/icons/icon-152x152.png",
    "revision": "e6bf3f87bd28bf274eddf0c6acbec4af"
  },
  {
    "url": "img/icons/icon-192x192.png",
    "revision": "2e4448471960880264cae9852e86c0a1"
  },
  {
    "url": "img/icons/icon-384x384.png",
    "revision": "d323c452b96055a5298878481346c1a2"
  },
  {
    "url": "img/icons/icon-512x512.png",
    "revision": "ab7322b22e9231dd4311145e73e79271"
  },
  {
    "url": "img/icons/icon-72x72.png",
    "revision": "57fa1a80202708b3764465bb6c166c5a"
  },
  {
    "url": "img/icons/icon-96x96.png",
    "revision": "0b691bdd6f329cc5d9d30d703f0e3fe9"
  },
  {
    "url": "index.html",
    "revision": "df6b863053b033a431eeef5bffa06ff2"
  },
  {
    "url": "js/dbhelper.js",
    "revision": "6fdf899195bdd9ba1137bbca8b4598ce"
  },
  {
    "url": "js/main.js",
    "revision": "c005431f32cb939687aff788567a2091"
  },
  {
    "url": "js/restaurant_info.js",
    "revision": "c42ccac5bb8d300dfb988a9ee3ec5fad"
  },
  {
    "url": "restaurant.html",
    "revision": "ac8e75a8cb3ea09366a947997e805b22"
  },
  {
    "url": "sw.src.js",
    "revision": "0b964aaec789a2de6adeff564bb7df71"
  },
  {
    "url": "workbox-config.js",
    "revision": "6bade2a8c20e9014ca5fc32b60ec3c77"
  }
].concat(self.__precacheManifest || []);

workbox.precaching.suppressWarnings();

workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
