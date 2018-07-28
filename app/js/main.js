import { oneLineTrim } from 'common-tags';
import '../css/styles.css';
import 'normalize.css/normalize.css';

import loadGoogleMapsApi from 'load-google-maps-api';
import {
  registerSW,
  titleGoogleMap,
  loadRestaurants,
  getCuisines,
  getNeighborhoods,
  getRestByCuisineNeighborhood,
  urlForRestaurant,
  mapMarkerForRestaurant
} from './db';
import LazyLoad from './lazyload.es2015';
import '../manifest.json';

// registerSW();

let globalLazyLoad;
let globalMap;
let markers = [];
let globalMapLoaded;

const resetRestaurants = () => {
  // Remove all restaurants
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (markers && markers instanceof Array) {
    markers.forEach(m => m.setMap(null));
  }
  markers = [];
};

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img lazyload';
  const img = require(`../img/${restaurant.id}.jpg`);
  image.src = img.placeholder;
  image.setAttribute('data-src', img.src);
  image.setAttribute('data-srcset', img.srcSet);
  image.alt = `Photo for ${restaurant.name}`;
  li.append(image);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = urlForRestaurant(restaurant);
  li.append(more);

  return li;
};

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
  src=${encodeURI(url)} alt="Map of all restaurants" id="mapImage">
  `;
  document.querySelector(`#${elementId}`).innerHTML = mapsImage;
};

const addInteractiveMap = elementId => new Promise((resolve, reject) => {
  if (!globalMapLoaded) {
    loadGoogleMapsApi({ key: 'AIzaSyB4KP3fH_OO_RnMVzIQ6_w5JEPQZsbue3M', libraries: ['places'] })
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
        resolve(googleMaps);
      }).catch((error) => { reject(new Error(error)); console.error(error); });
  } else {
    resolve(globalMap);
  }
});

const initMap = (height, elementId) => new Promise(((resolve, reject) => {
  if (!document.querySelector(`#${elementId}`)) {
    console.error('No place to draw the map', elementId);
    reject(Error('No place to draw the map'));
  }
  if (window.matchMedia('(max-width:600px)').matches) {
    // optimize performance for phones
    staticMapImage(height, elementId);
    document.querySelector(`#${elementId}`).addEventListener(
      'mouseover', () => { addInteractiveMap(elementId); },
      { once: true }
    );
  } else {
    addInteractiveMap(elementId)
      .then(resolve('Init map is done'));
  }
}));

const addMarkersToMap = (restaurants, elementId) => {
  addInteractiveMap(elementId)
    .then((googleMap) => {
      restaurants.forEach((restaurant) => {
        const marker = mapMarkerForRestaurant(restaurant, globalMap);
        google.maps.event.addListener(marker, 'click', () => {
          window.location.href = marker.url;
        });
        markers.push(marker);
      });
    });
};

const fillRestaurantsHTML = (restaurants) => {
  console.warn(restaurants);
  const ul = document.querySelector('#restaurants-list');
  restaurants.forEach((restaurant) => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap(restaurants, 'map');
  globalLazyLoad = new LazyLoad();
};

const fillCuisinesHTML = (cuisines) => {
  const select = document.getElementById('cuisines-select');
  cuisines.forEach(
    (cuisine) => {
      const option = document.createElement('option');
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
    }
  );
};

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = (restaurants = false) => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  loadRestaurants()
    .then((response) => {
      const filtered = getRestByCuisineNeighborhood(cuisine, neighborhood, response);
      resetRestaurants();
      fillRestaurantsHTML(filtered);
    })
    .catch(err => console.error(err));
};

const loadAndUpdateRestaurants = () => {
  loadRestaurants()
    .then((response) => {
      updateRestaurants(response);
    })
    .catch(err => console.error(err));
};

const fillNeighborhoodsHTML = (neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  console.log('fillNeighborhoodsHTML', neighborhoods);
  neighborhoods.forEach(
    (neighborhood) => {
      const option = document.createElement('option');
      option.innerHTML = neighborhood;
      option.value = neighborhood;
      select.append(option);
    }
  );
};

const fetchRestaurants = () => {
  loadRestaurants()
    .then((restaurants) => {
      fillNeighborhoodsHTML(getNeighborhoods(restaurants));
      fillCuisinesHTML(getCuisines(restaurants));
      updateRestaurants(restaurants);
    });
};

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  initMap(400, 'map')
    .then(fetchRestaurants());
  document.getElementById('neighborhoods-select').addEventListener('change', loadAndUpdateRestaurants);
  document.getElementById('cuisines-select').addEventListener('change', loadAndUpdateRestaurants);
});
