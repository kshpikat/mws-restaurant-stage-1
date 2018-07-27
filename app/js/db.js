import lf from 'localforage';
import _ from 'underscore';

const apiServer = 'https://mws-stage-2-nehlregqhh.now.sh';
const apiAllRestaurants = `${apiServer}/restaurants`;

const dbAllItems = 'restaurants';

lf.config({
  driver: lf.INDEXEDDB,
  name: 'Restaurant Reviews',
  version: 1.0,
  storeName: 'restreviews_1'
});

export const loadRestaurants = () => {
  fetch(apiAllRestaurants)
    .then((response) => {
      response.json()
        .then((json) => {
          lf.setItem(dbAllItems, JSON.stringify(json));
        })
        .then(() => {
          lf.getItem(dbAllItems);
        })
        .then((restaurants) => {
          JSON.parse(restaurants);
        });
    })
    .catch(() => {
      console.error("Can not fetch restaurant data. Trying to get it from IndexedDB...");
      getFromIndexeDB(dbAllItems);
    });
};

const getFromIndexeDB = ItemName => lf.getItem(ItemName)
  .then(value => JSON.parse(value))
  .catch(error => console.log(error));

export const getRestById = (id, restaurants) => restaurants.find(r => r.id === id);
export const getRestByCuisine = (cuisine, restaurants) => restaurants.filter(r => r.cuisine_type === cuisine);

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

const getUniqueFieldValuesFromAssocArray = (arr, key) => _.uniq(_.pluck(arr, key));

export const getNeighborhoods = (restaurants) => {
  const key = 'neighborhood';
  return getUniqueFieldValuesFromAssocArray(restaurants, key);
};

export const getCuisines = (restaurants) => {
  const key = 'cuisine_type';
  return getUniqueFieldValuesFromAssocArray(restaurants, key);
};

export const urlForRestaurant = restaurant => `./restaurant.html?id=${restaurant.id}`;

export const mapMarkerForRestaurant = (restaurant, map) => {
  const marker = new google.maps.Marker({
    position: restaurant.latlng,
    title: restaurant.name,
    url: urlForRestaurant(restaurant),
    map: map
  });
  return marker;
};
