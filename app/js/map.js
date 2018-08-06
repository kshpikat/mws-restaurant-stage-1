import { oneLineTrim } from 'common-tags';
import { load, urlSettings } from 'google-maps-promise/es2015';
import LazyLoad from './lazyload.es2015';
import {
  titleGoogleMap,
  mapMarkerForRestaurant
} from './db';

let globalLazyLoad;
let markers = [];
let globalMap;
let globalMapLoaded;

export const isDevMode = () => process.env.NODE_ENV !== 'production';

export const isInteractiveMapLoaded = () => globalMapLoaded;

export const cleanMarkers = () => {
  if (markers && markers instanceof Array) {
    markers.forEach(m => m.setMap(null));
  }
  markers = [];
};

export const addMarkersToMap = (restaurants) => {
  if (isDevMode()) {
    console.log('addMarkersToMap, is interactive map loaded?', globalMapLoaded);
  }
  if (!Array.isArray(restaurants)) {
    console.warn('restaurants is not an array', restaurants);
    return false;
  }
  if (globalMapLoaded) {
    restaurants.forEach((restaurant) => {
      const marker = mapMarkerForRestaurant(restaurant, globalMap);
      google.maps.event.addListener(marker, 'click', () => {
        window.location.href = marker.url;
      });
      markers.push(marker);
    });
  }
};

const addInteractiveMap = elementId => new Promise((resolve, reject) => {
  urlSettings.key = 'AIzaSyB4KP3fH_OO_RnMVzIQ6_w5JEPQZsbue3M';
  urlSettings.libraries = ['places'];
  if (!globalMapLoaded) {
    load()
      .then((googleMaps) => {
        globalMap = new googleMaps.Map(
          document.querySelector(`#${elementId}`),
          {
            zoom: 12,
            center: {
              lat: 40.722216,
              lng: -73.987501
            },
            scrollwheel: false
          }
        );
        globalMapLoaded = true;
        titleGoogleMap(globalMap, 'Restaurants Map');
        resolve('addInteractiveMap rendered');
      }).catch((error) => { reject(new Error(error)); console.error(error); });
  } else {
    resolve(globalMap);
  }
});

const staticMapImage = (height, elementId) => {
  const width = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

  const url = oneLineTrim`
    https://maps.googleapis.com/maps/api/staticmap?center=40.722216,+-73.987501&
    zoom=12&
    scale=2&
    size=${width}x${height}&
    maptype=roadmap&format=png&
    visual_refresh=true&
    key=AIzaSyAI60PBarZdCiO-BYJqYvoDYBL8F68-PEU&
    markers=size:mid%7Ccolor:red%7C
    |40.683555,-73.966393|
    |40.713829,-73.989667|
    |40.747143,-73.985414|
    |40.722216,-73.987501|
    |40.705089,-73.933585|
    |40.674925,-74.016162|
    |40.727397,-73.983645|
    |40.726584,-74.002082|
    |40.743797,-73.950652|
    |40.743394,-73.954235|
    `;

  const mapsImage = `
  <img width="${width}px"
  data-src=${encodeURI(url)} class="lazyload" alt="Map of all restaurants" id="mapImage">
  `;
  document.querySelector(`#${elementId}`).innerHTML = mapsImage;
  globalLazyLoad = new LazyLoad({ threshold: 0 });
};

export const initMap = (height, elementId, getRestCacheCallback) => new Promise(((resolve, reject) => {
  if (!document.querySelector(`#${elementId}`)) {
    console.error('No place to draw the map', elementId);
    reject(Error('No place to draw the map'));
  }
  if (window.matchMedia('(max-width:600px)').matches) {
    // optimize performance for phones
    staticMapImage(height, elementId);
    document.querySelector('#mapImage').addEventListener(
      'mouseover', () => {
        addInteractiveMap(elementId)
          .then(() => { addMarkersToMap(getRestCacheCallback()); });
      },
      { once: true }
    );
    if (isDevMode()) {
      console.log('Static map is done');
    }
    resolve('Static map is done');
  } else {
    addInteractiveMap(elementId)
      .then(() => {
        if (isDevMode()) {
          console.log('Interactive map is done');
        }
        resolve('Interactive map is done');
      });
  }
}));
