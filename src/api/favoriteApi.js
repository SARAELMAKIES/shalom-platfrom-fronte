// src/api/favoriteApi.js
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

export const getFavoriteItemsByIds = (ids) => {
  const idsParam = ids.join(',');
  return axios.get(`${BASE_URL}/items/by-ids?ids=${idsParam}`);
};
