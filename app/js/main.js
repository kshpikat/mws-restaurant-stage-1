import '../css/styles.css';
import 'normalize.css/normalize.css';
import LazyLoad from './lazyload.es2015';
import '../manifest.json';

import {
  registerSW,
  loadRestaurants,
  getCuisines,
  getNeighborhoods,
  getRestByCuisineNeighborhood,
  urlForRestaurant
} from './db';

import {
  isDevMode,
  isInteractiveMapLoaded,
  addMarkersToMap,
  initMap,
  cleanMarkers
} from './map';


registerSW();

let globalLazyLoad;
let globalRestCache;

const setRestCache = (restaurants) => { globalRestCache = restaurants; };

const resetRestaurants = () => {
  // Remove all restaurants
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  cleanMarkers();
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

  const name = document.createElement('h3');
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
  more.setAttribute('role', 'button');
  more.href = urlForRestaurant(restaurant);
  li.append(more);

  return li;
};

const fillRestaurantsHTML = (restaurants) => {
  if (isDevMode()) {
    console.log('fillRestaurantsHTML main.js:162', restaurants);
  }
  const ul = document.querySelector('#restaurants-list');
  restaurants.forEach((restaurant) => {
    ul.append(createRestaurantHTML(restaurant));
  });
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

const updateRestaurants = (restaurants = false) => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  const filtered = getRestByCuisineNeighborhood(cuisine, neighborhood, restaurants);
  resetRestaurants();
  fillRestaurantsHTML(filtered);
  addMarkersToMap(filtered);
  setRestCache(filtered);
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
  if (isDevMode()) {
    console.log('fillNeighborhoodsHTML', neighborhoods);
  }
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


const renderMap = () => {
  initMap(400, 'map', () => globalRestCache)
    .then(() => {
      fetchRestaurants();
    });
};


document.addEventListener('DOMContentLoaded', () => {
  renderMap();
  document.getElementById('neighborhoods-select').addEventListener('change', loadAndUpdateRestaurants);
  document.getElementById('cuisines-select').addEventListener('change', loadAndUpdateRestaurants);
});

window.addEventListener('resize', () => {
  if (!isInteractiveMapLoaded()) {
    renderMap();
  }
});
