/* global google */
import { oneLineTrim } from 'common-tags';
import { MDCSnackbar } from '@material/snackbar';
import lf from 'localforage';
import { extendPrototype } from 'localforage-startswith';

extendPrototype(lf);

const dbPrefixRests = 'restaurants';
const dbPrefixReview = 'review';

const getServer = () => 'https://reviews-server.tt34.com';
const getAllRestUrl = () => `${getServer()}/restaurants`;
const getRestReviewUrl = () => `${getServer()}/reviews`;
const getRestReviewByRestUrl = () => `${getRestReviewUrl()}/?restaurant_id=`;
const getRestByIdReviewsUrl = restId => `${getRestReviewByRestUrl()}${restId}`;

lf.config({
  driver: lf.INDEXEDDB,
  name: 'Restaurant Reviews',
  version: 1.0,
  storeName: 'restreviews_3'
});

const getFromDB = key => lf.getItem(key).then(value => value);
export const pluck = (array, key) => array.map(object => object[key]);
export const uniq = array => array.filter((v, i, a) => a.indexOf(v) === i);
export const zeroPad = (num, places = 10) => {
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join('0') + num;
};

export const loadRestaurants = () => fetch(getAllRestUrl(), { credentials: 'omit' })
  .then(response => response
    .json()
    .then(json => lf.setItem(dbPrefixRests, json))
    .then(() => lf.getItem(dbPrefixRests))
    .then(restaurants => restaurants))
  .catch(() => {
    // offline
    console.warn('Can not fetch rest data. Going to check it in DB...');
    return getFromDB(dbPrefixRests);
  });

export const setFavorite = (restId, isFavorite) => {
  console.info(`going to update ${restId} with ${isFavorite}`);
  return lf.getItem(dbPrefixRests)
    .then((items) => {
      for (let i = 0; i < items.length; i += 1) {
        if (parseInt(items[i].id, 10) === parseInt(restId, 10)) {
          items[i].is_favorite = isFavorite;
          break;
        }
      }
      console.info(`is_favorite updated for restId:${restId}`);
      return lf.setItem(dbPrefixRests, items);
    });
};

export const getNextReviewId = () => {
  // For real world application I would make something like UUID
  // Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36).substr(2, 10);
  let maxId = 0;
  const prefixRegexp = new RegExp(`^${dbPrefixReview}-`);
  return lf.iterate((v, k) => {
    if (prefixRegexp.test(k)) {
      console.info('found review record', k);
      if (v.id > maxId) {
        console.info(v.id, 'is more than', maxId);
        maxId = v.id;
      }
    }
  }).then(() => {
    maxId += 200;
    console.log('Next ID for review is');
    console.log(maxId);
    return maxId;
  });
};

export const storeReview = (review) => {
  const formattedId = zeroPad(parseInt(review.id, 10));
  const key = `${dbPrefixReview}-${review.restaurant_id}-${formattedId}`;
  console.info(`going to save review with key ${key}`, review);
  return lf.setItem(key, review);
};
export const storeReviews = reviews => Promise.all(reviews.map(item => storeReview(item)));
export const getReviewsByRestId = (restId) => {
  const prefix = `${dbPrefixReview}-${restId}-`;
  console.info(`going to grab reviews with prefix ${prefix}`);
  return lf.startsWith(prefix)
    .then((reviews) => {
      console.info('Reviews from DB', reviews);
      return reviews;
    });
};

export const loadRestReviewsByRest = (restId) => {
  console.info(`going to retrieve reviews for rest ${restId}`);
  return fetch(getRestByIdReviewsUrl(restId), { credentials: 'omit' })
    .then(response => response
      .json()
      .then(json => storeReviews(json))
      .then(() => getReviewsByRestId(restId))
      .then(reviews => reviews))
    .catch((error) => {
      console.warn(error);
      //  network failure or offline situation
      console.log('Can not get reviews by rest data. Trying to get it from IndexedDB...');
      return getReviewsByRestId(restId);
    });
};

export const showNotification = (text, options = { needRefresh: false }) => {
  const snackbar = document.querySelector('#notifications');
  snackbar.innerHTML = oneLineTrim`
  <div class="mdc-snackbar" aria-live="assertive" aria-atomic="true" aria-hidden="true">
    <div class="mdc-snackbar__text"></div>
    <div class="mdc-snackbar__action-wrapper">
    <button type="button" class="mdc-snackbar__action-button"></button>
    </div>
  </div>`;

  const snackbarJS = new MDCSnackbar(snackbar.querySelector('.mdc-snackbar'));

  if (options.needRefresh) {
    snackbarJS.show({
      message: text,
      multiline: true,
      timeout: 60000,
      actionText: 'Refresh',
      actionHandler: () => {
        window.location.reload();
      }
    });
  } else {
    snackbarJS.show({
      message: text,
      timeout: 5000,
      multiline: true
    });
  }
};

export const getRestById = (n, h) => h.find(r => String(r.id) === String(n));
export const getRestByCuisine = (n, h) => h.filter(r => r.cuisine_type === n);

export const getRestByCuisineNeighborhood = (cuisine, neighborhood, restaurants) => {
  let results = restaurants;
  if (cuisine !== 'all') {
    results = results.filter(r => r.cuisine_type === cuisine);
  }
  if (neighborhood !== 'all') {
    results = results.filter(r => r.neighborhood === neighborhood);
  }
  return results;
};

export const getNeighborhoods = restaurants => uniq(pluck(restaurants, 'neighborhood'));
export const getCuisines = restaurants => uniq(pluck(restaurants, 'cuisine_type'));
export const urlForRestaurant = restaurant => `./restaurant.html?id=${restaurant.id}`;

export const mapMarkerForRestaurant = (restaurant, map) => new google.maps.Marker({
  position: restaurant.latlng,
  title: restaurant.name,
  url: urlForRestaurant(restaurant),
  map
});

export const titleGoogleMap = (map, title) => {
  google.maps.event.addListener(map, 'tilesloaded', () => {
    try {
      document.getElementById('map')
        .querySelector('iframe')
        .title = title;
    } catch (e) {
      console.warn('Could not set map title', e);
    }

    return map;
  });
};

export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(() => {
          navigator.serviceWorker.addEventListener('message', (event) => {
            switch (event.data) {
              case 'favorite-stored':
              case 'reviews-stored':
                showNotification('Record stored in IndexedDB');
                break;
              case 'reviews-inprogress':
              case 'favorite-inprogress':
                showNotification('Record start sync');
                break;
              case 'reviews-done':
              case 'favorite-done':
                showNotification('Sync done! Please refresh the page.', { needRefresh: true });
                break;
              default:
                console.info('Client received unknown Message:', event.data);
            }
          });
        });
    });
  }
};

export const sendFavorite = (restaurantId, isFavorite) => {
  showNotification('Going to send Favorite flag to the Server...');
  return fetch(`${getAllRestUrl()}/${restaurantId}/`,
    {
      method: 'PUT',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `is_favorite=${(isFavorite) ? 1 : 0}`
    })
    .catch(() => {
      // offline
      showNotification('Upsss... bad connection, but don\'t worry! We\'ll save it in DB for now ;)');
      console.warn('Can not send Fav flag.');
    });
};

export const sendReview = (review) => {
  showNotification('Going to send Review to the Server...');
  return fetch(`${getRestReviewUrl()}/`,
    {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    })
    .catch(() => {
      // offline
      showNotification('Upsss... bad connection, but don\'t worry! We\'ll save it in DB for now ;)');
      console.warn('Can not send Review.');
    });
};
