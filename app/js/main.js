import { oneLineTrim } from 'common-tags';
import { MDCRipple } from '@material/ripple';
import '../css/common.scss';
import '../css/card.scss';
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

if (process.env.NODE_ENV !== 'development') {
  registerSW();
}

let globalLazyLoad;
let globalRestCache;

const setRestCache = (restaurants) => { globalRestCache = restaurants; };
const getRestContainerEl = () => document.querySelector('.cards');

const resetRestaurants = () => {
  getRestContainerEl().innerHTML = '';
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

const getHTMLFromElement = (el) => {
  const wrap = document.createElement('div');
  wrap.append(el);
  return wrap.innerHTML;
};

const createRestaurantCardHTML = (restaurant) => {
  const wrap = document.createElement('div');
  const image = document.createElement('img');
  image.className = 'restaurant-img lazyload';
  const img = require(`../img/${restaurant.id}.jpg`);
  image.src = img.placeholder;
  image.setAttribute('data-src', img.src);
  image.setAttribute('data-srcset', img.srcSet);
  image.setAttribute('style', 'width:100%');
  image.alt = `Photo for ${restaurant.name}`;
  const imageHTML = getHTMLFromElement(image);

  const cardHTML = oneLineTrim`
  <div class="mdc-card demo-card demo-card--hero">
  <div class="mdc-card__primary-action mdc-ripple-upgraded" tabindex="0">
      <div class="mdc-card__media demo-card__media">
        ${imageHTML}
      </div>
      <div class="demo-card__primary">
          <h3 class="demo-card__title mdc-typography--headline6">
            ${restaurant.name}
          </h3>
      </div>
      <div class="demo-card__secondary mdc-typography--body2">
          ${restaurant.neighborhood}<br>
          ${restaurant.address}
      </div>
  </div>
  <div class="mdc-card__actions">
      <div class="mdc-card__action-buttons">
          <a href="${urlForRestaurant(restaurant)}" class="mdc-button mdc-card__action mdc-card__action--button mdc-ripple-upgraded">
              View
          </a>
      </div>
      <div class="mdc-card__action-icons">
          <button class="mdc-icon-button material-icons mdc-card__action mdc-card__action--icon mdc-ripple-upgraded--unbounded mdc-ripple-upgraded" aria-pressed="false" aria-label="Add to favorites" title="Add to favorites" data-toggle-on-content="favorite" data-toggle-on-label="Remove from favorites" data-toggle-off-content="favorite_border" data-toggle-off-label="Add to favorites">favorite</button>
      </div>
  </div>
</div>
  `;

  return cardHTML;
};

const fillRestaurantsHTML = (restaurants) => {
  if (isDevMode()) {
    console.log('fillRestaurantsHTML main.js:162', restaurants);
  }
  // const ul = document.querySelector('#restaurants-list');
  // restaurants.forEach((restaurant) => {
  //   ul.append(createRestaurantHTML(restaurant));
  // });
  let cardsHTML = '';
  restaurants.forEach((restaurant) => {
    cardsHTML += createRestaurantCardHTML(restaurant);
  });
  getRestContainerEl().innerHTML = cardsHTML;
  globalLazyLoad = new LazyLoad({ threshold: 0 });
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

const initMaterial = () => {
  const ripples = [];
  document.querySelectorAll('.mdc-card__primary-action').forEach(el => ripples.push(new MDCRipple(el)));
  document.querySelectorAll('.mdc-button').forEach(el => ripples.push(new MDCRipple(el)));
  document.querySelectorAll('.mdc-icon-button')
    .forEach((el) => {
      const ripple = new MDCRipple(el);
      ripple.unbounded = true;
      ripples.push(ripple);
    });
};


document.addEventListener('DOMContentLoaded', () => {
  renderMap();
  document.getElementById('neighborhoods-select').addEventListener('change', loadAndUpdateRestaurants);
  document.getElementById('cuisines-select').addEventListener('change', loadAndUpdateRestaurants);
  initMaterial();
});

window.addEventListener('resize', () => {
  if (!isInteractiveMapLoaded()) {
    renderMap();
  }
});
