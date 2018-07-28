import lf from 'localforage';
import _ from 'underscore';

// const getServerUrl = () => 'https://mws-stage-2-nehlregqhh.now.sh';
const getAllRestUrl = () => 'https://mws-stage-2-nehlregqhh.now.sh/restaurants';

lf.config({
  driver: lf.INDEXEDDB,
  name: 'Restaurant Reviews',
  version: 1.0,
  storeName: 'restreviews_1'
});

const getFromDB = key => lf.getItem(key)
  .then(value => JSON.parse(value)).catch(error => console.log(error));

export const loadRestaurants = () => fetch(getAllRestUrl(), { credentials: 'omit' })
  .then(response => response
    .json()
    .then((json) => {
      console.log('This JSON came from fetch', json);
      return lf.setItem('restaurants', JSON.stringify(json));
    })
    .then(() => lf.getItem('restaurants'))
    .then((restaurants) => {
      const json = JSON.parse(restaurants);
      console.log('This JSON came back from DB ', json);
      return json;
    }))
  .catch(() => {
    //  network failure or offline situation
    console.log(
      'Can not fetch restaurant data. Trying to get it from IndexedDB...'
    );
    return getFromDB('restaurants');
  });

export const getRestById = (needle, restaurants) => restaurants.find(r => r.id === needle);
export const getRestByCuisine = (needle, restaurants) => restaurants.filter(r => r.cuisine_type === needle);

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

const getUniqValsFromAssocArray = (arr, key) => _.uniq(_.pluck(arr, key));
export const getNeighborhoods = restaurants => getUniqValsFromAssocArray(restaurants, 'neighborhood');
export const getCuisines = restaurants => getUniqValsFromAssocArray(restaurants, 'cuisine_type');
export const urlForRestaurant = restaurant => `./restaurant.html?id=${restaurant.id}`;

export const mapMarkerForRestaurant = (restaurant, map) => {
  const marker = new google.maps.Marker({
    position: restaurant.latlng,
    title: restaurant.name,
    url: urlForRestaurant(restaurant),
    map
  });
  return marker;
};

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
      navigator.serviceWorker.register('/sw.js');
    });
  }
};
