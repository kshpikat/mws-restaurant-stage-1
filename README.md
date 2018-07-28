# Mobile Web Specialist Certification Course

## Project Overview: Stage 1 + 2

Restaurant reviews website was optimized and fixed. Now it's optimized for different screen resolutions on desktop as well as for mobile. Also it was revamped with accessibility features. Offline feature was added with the help of Service Worker.

On Stage 2 build process was setup and polished to make the final result optimized, minified, compressed, resized, etc. to get [wonderful numbers in Lighthouse](https://i.paste.pics/3HFTU.png) audit tool in Chrome.


Also, after some work from Stage 1 and polishing it a bit, we've go PWA application which we can install on the Home screen (tested on Android 7.0).  

## What do I do from here?

1. In this folder there is package.json and webpack.prod.js configs. First things first - run `npm i` to download and setup all the dependencies. 

2. After that you need only `npm run build` command to create the bundle in the `dist` folder to publish on webserver.

3. Start up a simple HTTP server to serve up the site files on your local computer. [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en) will do it for you quickly and in a very strait forward way. Target it to the `dist` folder I mentioned in step 2.

4. With your server running, visit the site: (usually it's `http://localhost:8000` but port can be different, depends on your settings).

## Offline Requests

Offline request caching was implemented using [Workbox library](https://developers.google.com/web/tools/workbox/modules/workbox-background-sync#testing_workbox_background_sync) from Google. To test this functionality is to actually disconnect the test machine from the internet. Clicking the `offline` checkbox in Chrome dev tools will not suffice.

Stage 2: To store the information about Restaurants [localForage library](https://localforage.github.io/localForage/) was used. Every time we get response from API server - we store this information into IndexedDB.

## Continious Integration + Continious Delivery

Two servers were setup to make the process of deployment nice and smooth. Also that allows to test real-world behaviour of Restaurants Reviews application including domain name, HTTPS protocol, cross-site AJAX requests, etc.

[Netlify](http://netlify.com) was used to provision webpack build on each git push into repository and publish results on [Reviews subdomain](http://reviews.tt34.com).

[Zeit.co](https://zeit.co/docs) was used to setup API server using docker image with [standard Sails server provided by Udacity](https://github.com/udacity/mws-restaurant-stage-2).