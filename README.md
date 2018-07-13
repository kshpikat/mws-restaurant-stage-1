# Mobile Web Specialist Certification Course

## Project Overview: Stage 1

Restaurant reviews website was optimized and fixed. Now it's optimized for different screen resolutions on desktop as well as for mobile. Also it was revamped with accessibility features. Offline feature was added with the help of Service Worker.

## What do I do from here?

1. In this folder, start up a simple HTTP server to serve up the site files on your local computer. [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en) will do it for you quickly and in a very strait forward way. 

2. With your server running, visit the site: (usually it's `http://localhost:8000` but port can be different, depends on your settings).

## Offline Requests

Offline request caching was implemented using [Workbox library](https://developers.google.com/web/tools/workbox/modules/workbox-background-sync#testing_workbox_background_sync) from Google. To test this functionality is to actually disconnect the test machine from the internet. Clicking the `offline` checkbox in Chrome dev tools will not suffice.


