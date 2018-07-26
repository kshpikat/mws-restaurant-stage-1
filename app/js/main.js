import { oneLineTrim } from 'common-tags';
import "../css/styles.css";
import "normalize.css/normalize.css";

import loadGoogleMapsApi from "load-google-maps-api";
import { DBHelper, isHome, titleGoogleMap } from './dbhelper';
import LazyLoad from './lazyload.es2015';


// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', function () {
//         navigator.serviceWorker.register('/sw.js');
//     });
// }

let globalLazyLoad;
let globalRestaurants;
let globalNeighborhoods;
let globalCuisines;
let globalMap;
let markers = [];
let globalMapLoaded;

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (newItems = globalNeighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  newItems.forEach((neighborhood) => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (inboundCuisines = globalCuisines) => {
  const select = document.getElementById('cuisines-select');

  inboundCuisines.forEach((cuisine) => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (newItems) => {
  // Remove all restaurants
  globalRestaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (markers && markers instanceof Array) {
    markers.forEach(m => m.setMap(null));
  }
  markers = [];
  globalRestaurants = newItems;
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
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (newItems = globalRestaurants) => {
  addInteractiveMap();
  newItems.forEach((restaurant) => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, globalMap);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    markers.push(marker);
  });
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (newItems = globalRestaurants) => {
  const ul = document.getElementById('restaurants-list');
  newItems.forEach((restaurant) => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
  globalLazyLoad = new LazyLoad();
};

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 *  creates static map image
 */
const staticMapImage = (height, element) => {
  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

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
  document.getElementById(`${element}`).innerHTML = mapsImage;
};

const addInteractiveMap = () => {
  loadGoogleMapsApi({ key: 'AIzaSyB4KP3fH_OO_RnMVzIQ6_w5JEPQZsbue3M', libraries: ['places'] })
    .then((googleMaps) => {
      globalMap = new googleMaps.Map(document.querySelector('#map'), {
        zoom: 12,
        center: {
          lat: 40.722216,
          lng: -73.987501
        },
        scrollwheel: false
      });
      globalMapLoaded = true;
      titleGoogleMap(globalMap, 'Restaurants Map');
      updateRestaurants();
    }).catch((error) => {
      console.error(error);
    });
};

const initMap = (height, element) => {
  // load static maps image for smaller devices
  if (window.matchMedia('(max-width:600px)').matches) {
    staticMapImage(height, element);
    document.getElementById(element).addEventListener(
      'mouseover',
      () => {
        if (!globalMapLoaded) {
          addInteractiveMap();
        }
      },
      { once: true }
    );
  } else {
    addInteractiveMap();
  }
};

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, newItems) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      globalCuisines = newItems;
      fillCuisinesHTML();
    }
  });
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, newItems) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      globalNeighborhoods = newItems;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  initMap(400, 'map');
  fetchNeighborhoods();
  fetchCuisines();
  document.getElementById('neighborhoods-select').addEventListener('change', updateRestaurants);
  document.getElementById('cuisines-select').addEventListener('change', updateRestaurants);
});
