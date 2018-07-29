import '../css/styles.css';
import 'normalize.css/normalize.css';
import _ from 'underscore';
import LazyLoad from './lazyload.es2015';
import '../manifest.json';

import {
  isInteractiveMapLoaded,
  addMarkersToMap,
  initMap
} from './map';

import {
  registerSW,
  loadRestaurants,
  getRestById,
} from './db';

registerSW();

let globalLazyLoad;
let globalRestCache;

const fillRestaurantHoursHTML = (operatingHours) => {
  const hours = document.getElementById('restaurant-hours');
  if (!hours || Array.isArray(operatingHours)) {
    return false;
  }
  _.keys(operatingHours).forEach((key) => {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  });
};

const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.tabIndex = 0;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

const fillReviewsHTML = (reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  title.tabIndex = 0;
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach((review) => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};


const fillRestaurantHTML = (restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  if (image) {
    const img = require(`../img/${restaurant.id}.jpg`);
    image.src = img.placeholder;
    image.setAttribute('data-src', img.src);
    image.setAttribute('data-srcset', img.srcSet);
    image.className = 'restaurant-img lazyload';
    image.alt = `Photo for ${restaurant.name}`;
    globalLazyLoad = new LazyLoad();
  }

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML(restaurant.operating_hours);
  }
  if (restaurant.reviews) {
    fillReviewsHTML(restaurant.reviews);
  }
};

const fillBreadcrumb = (restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
};

const getParameterByName = (name, urlString = document.location) => {
  const url = new URL(urlString);
  return url.searchParams.get(name);
};

const renderMap = () => {
  initMap(400, 'map', () => [globalRestCache])
    .then(() => {
      addMarkersToMap([globalRestCache]);
    });
};

document.addEventListener('DOMContentLoaded', () => {
  loadRestaurants()
    .then((restaurants) => {
      const id = getParameterByName('id');
      if (!id) {
        console.error('No restaurant id in URL');
        window.location.href = 'index.html';
      } else {
        globalRestCache = getRestById(id, restaurants);
        fillRestaurantHTML(globalRestCache);
        fillBreadcrumb(globalRestCache);
        renderMap();
      }
    });
});

window.addEventListener('resize', () => {
  if (!isInteractiveMapLoaded()) {
    renderMap();
  }
});
