// import axios from 'axios';

// const BASE_URL = 'http://localhost:3001/api/locations'; // הנתיב הבסיסי למיקומים

// /**
//  * מאחזר מיקום בודד לפי ה-ID שלו.
//  * @param {string} id - ה-ID של המקום לאחזור.
//  * @returns {Promise<Object>} - אובייקט המקום.
//  */
// export const fetchLocationById = async (id) => {
//   const response = await axios.get(`${BASE_URL}/${id}`);
//   return response.data;
// };

// /**
//  * מוסיף מקום חדש לשרת.
//  * @param {Object} locationData - נתוני המקום החדש, כולל קבצי תמונה.
//  * @returns {Promise<Object>} - אובייקט המקום שנוצר.
//  */
// export const addLocation = async (locationData) => {
//   const formData = new FormData();

//   if (locationData.images && locationData.images.length > 0) {
//     locationData.images.forEach((image) => {
//       formData.append('images', image);
//     });
//   }

//   formData.append('name', locationData.name);
//   formData.append('description', locationData.description || '');
//   formData.append('category_id', locationData.category_id);

//   if (locationData.lat) formData.append('lat', Number(locationData.lat));
//   if (locationData.lng) formData.append('lng', Number(locationData.lng));
//   if (locationData.city) formData.append('city', locationData.city);
//   if (locationData.area) formData.append('area', locationData.area);
//   if (locationData.country) formData.append('country', locationData.country);
//   if (locationData.user_id) formData.append('user_id', locationData.user_id);
//   if (locationData.restaurantType) formData.append('restaurantType', locationData.restaurantType);
//   if (locationData.kosherAuthority) formData.append('kosherAuthority', locationData.kosherAuthority);
//   if (locationData.kosherAuthorityOther) formData.append('kosherAuthorityOther', locationData.kosherAuthorityOther);
//   if (locationData.customCategoryName) formData.append('customCategoryName', locationData.customCategoryName);

//   if (locationData.existing_images && locationData.existing_images.length > 0) {
//     formData.append('existing_images', JSON.stringify(locationData.existing_images));
//   }

//   const response = await axios.post(BASE_URL, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return response.data;
// };

// /**
//  * מעדכן מקום קיים בשרת.
//  * @param {string} id - ה-ID של המקום לעדכון.
//  * @param {Object} locationData - הנתונים המעודכנים של המקום, כולל קבצי תמונה.
//  * @returns {Promise<Object>} - אובייקט המקום המעודכן.
//  */
// export const updateLocation = async ({ id, locationData }) => {
//   const formData = new FormData();

//   if (locationData.images) {
//     locationData.images.forEach((image) => {
//       formData.append('images', image);
//     });
//   }

//   formData.append('name', locationData.name);
//   formData.append('description', locationData.description || '');
//   formData.append('category_id', locationData.category_id);

//   if (locationData.lat) formData.append('lat', Number(locationData.lat));
//   if (locationData.lng) formData.append('lng', Number(locationData.lng));
//   if (locationData.city) formData.append('city', locationData.city);
//   if (locationData.area) formData.append('area', locationData.area);
//   if (locationData.country) formData.append('country', locationData.country);
//   if (locationData.user_id) formData.append('user_id', locationData.user_id);
//   if (locationData.restaurantType) formData.append('restaurantType', locationData.restaurantType);
//   if (locationData.kosherAuthority) formData.append('kosherAuthority', locationData.kosherAuthority);
//   if (locationData.kosherAuthorityOther) formData.append('kosherAuthorityOther', locationData.kosherAuthorityOther);
//   if (locationData.customCategoryName) formData.append('customCategoryName', locationData.customCategoryName);

//   if (locationData.existing_images) {
//     formData.append('existing_images', JSON.stringify(locationData.existing_images));
//   }

//   const response = await axios.put(`${BASE_URL}/${id}`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return response.data;
// };

// /**
//  * מוחק מיקום ספציפי מהשרת.
//  * @param {string} id - ה-ID של המיקום למחיקה.
//  * @param {string} userId - ה-ID של המשתמש המבקש למחוק.
//  * @param {string} role - תפקיד המשתמש המבקש למחוק.
//  * @returns {Promise<string>} - ה-ID של המיקום שנמחק.
//  */
// export const deleteLocation = async ({ id, userId, role }) => {
//   const response = await axios.delete(`${BASE_URL}/${id}`, {
//     params: { userId, role }
//   });
//   return response.data;
// };

// /**
//  * מאחזר רשימת מקומות עם פגינציה וסינון אופציונלי.
//  * @param {Object} params - פרמטרים לבקשה.
//  * @param {number} [params.page=1] - מספר העמוד.
//  * @param {number} [params.limit=6] - מספר המיקומים לעמוד.
//  * @param {string} [params.userId] - מזהה המשתמש לסינון.
//  * @param {string} [params.category_id] - מזהה הקטגוריה לסינון.
//  * @returns {Promise<Object>} - אובייקט המכיל את המיקומים, מספר העמוד, והאם יש עוד מיקומים.
//  */
// export const fetchLocations = async ({ page = 1, limit = 6, userId = undefined, category_id = '' }) => {
//   const params = { page, limit };
//   if (userId) {
//     params.userId = userId;
//   }
//   if (category_id) {
//     params.category_id = category_id;
//   }
//   const response = await axios.get(`${BASE_URL}`, { params });
//   return response.data;
// };

// /**
//  * מאחזר מיקומים של משתמש ספציפי עם פגינציה.
//  * @param {Object} params - פרמטרים לבקשה.
//  * @param {string} params.userId - ה-ID של המשתמש שאת המיקומים שלו יש לאחזר.
//  * @param {number} [params.page=1] - מספר העמוד.
//  * @param {number} [params.limit=6] - מספר המיקומים לעמוד.
//  * @returns {Promise<Object>} - אובייקט המכיל את המיקומים, מספר העמוד, והאם יש עוד מיקומים.
//  */
// export const fetchUserLocationsPaginated = async ({ userId, page = 1, limit = 6 }) => {
//   const response = await axios.get(`${BASE_URL}/user/${userId}?page=${page}&limit=${limit}`);
//   return { items: response.data.items, page, hasMore: response.data.hasMore };
// };

// /**
//  * מגדיל את מונה הצפיות של מיקום ספציפי.
//  * @param {string} locationId - ה-ID של המיקום.
//  * @returns {Promise<Object>} - אובייקט המכיל את מספר הצפיות המעודכן.
//  */
// export const incrementLocationViews = async (locationId) => {
//   const response = await axios.post(`${BASE_URL}/${locationId}/view`);
//   return response.data;
// };


// const locationsApi = {
//   fetchLocationById,
//   addLocation,
//   updateLocation,
//   deleteLocation,
//   fetchLocations,
//   fetchUserLocationsPaginated,
//   incrementLocationViews,
// };

// export default locationsApi;
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/locations'; // הנתיב הבסיסי למיקומים

/**
 * מאחזר מיקום בודד לפי ה-ID שלו.
 */
export const fetchLocationById = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * חיפוש מיקומים לפי מחרוזת.
 */
export const searchLocations = async (query) => {
  const response = await axios.get(`${BASE_URL}/search`, {
    params: { q: query }
  });
  return response.data;
};

/**
 * העלאת תמונות זמניות (לשימוש לפני יצירת מיקום).
 */
export const uploadTempImages = (formData) => {
  return axios.post(`http://localhost:3001/api/upload-temp-images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

/**
 * מוסיף מקום חדש לשרת.
 */
export const addLocation = async (locationData) => {
  const formData = new FormData();

  if (locationData.images && locationData.images.length > 0) {
    locationData.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  formData.append('name', locationData.name);
  formData.append('description', locationData.description || '');
  formData.append('category_id', locationData.category_id);

  if (locationData.lat) formData.append('lat', Number(locationData.lat));
  if (locationData.lng) formData.append('lng', Number(locationData.lng));
  if (locationData.city) formData.append('city', locationData.city);
  if (locationData.area) formData.append('area', locationData.area);
  if (locationData.country) formData.append('country', locationData.country);
  if (locationData.user_id) formData.append('user_id', locationData.user_id);
  if (locationData.restaurantType) formData.append('restaurantType', locationData.restaurantType);
  if (locationData.kosherAuthority) formData.append('kosherAuthority', locationData.kosherAuthority);
  if (locationData.kosherAuthorityOther) formData.append('kosherAuthorityOther', locationData.kosherAuthorityOther);
  if (locationData.customCategoryName) formData.append('customCategoryName', locationData.customCategoryName);

  if (locationData.existing_images && locationData.existing_images.length > 0) {
    formData.append('existing_images', JSON.stringify(locationData.existing_images));
  }

  const response = await axios.post(BASE_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * מעדכן מקום קיים בשרת.
 */
export const updateLocation = async ({ id, locationData }) => {
  const formData = new FormData();

  if (locationData.images) {
    locationData.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  formData.append('name', locationData.name);
  formData.append('description', locationData.description || '');
  formData.append('category_id', locationData.category_id);

  if (locationData.lat) formData.append('lat', Number(locationData.lat));
  if (locationData.lng) formData.append('lng', Number(locationData.lng));
  if (locationData.city) formData.append('city', locationData.city);
  if (locationData.area) formData.append('area', locationData.area);
  if (locationData.country) formData.append('country', locationData.country);
  if (locationData.user_id) formData.append('user_id', locationData.user_id);
  if (locationData.restaurantType) formData.append('restaurantType', locationData.restaurantType);
  if (locationData.kosherAuthority) formData.append('kosherAuthority', locationData.kosherAuthority);
  if (locationData.kosherAuthorityOther) formData.append('kosherAuthorityOther', locationData.kosherAuthorityOther);
  if (locationData.customCategoryName) formData.append('customCategoryName', locationData.customCategoryName);

  if (locationData.existing_images) {
    formData.append('existing_images', JSON.stringify(locationData.existing_images));
  }

  const response = await axios.put(`${BASE_URL}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * מוחק מיקום מהשרת.
 */
export const deleteLocation = async ({ id, userId, role }) => {
  const response = await axios.delete(`${BASE_URL}/${id}`, {
    params: { userId, role }
  });
  return response.data;
};

/**
 * שליפת מיקומים עם פגינציה.
 */
export const fetchLocations = async ({ page = 1, limit = 6, userId = undefined, category_id = '' }) => {
  const params = { page, limit };
  if (userId) params.userId = userId;
  if (category_id) params.category_id = category_id;

  const response = await axios.get(`${BASE_URL}`, { params });
  return response.data;
};

/**
 * שליפת מיקומים של משתמש ספציפי.
 */
export const fetchUserLocationsPaginated = async ({ userId, page = 1, limit = 6 }) => {
  const response = await axios.get(`${BASE_URL}/user/${userId}?page=${page}&limit=${limit}`);
  return { items: response.data.items, page, hasMore: response.data.hasMore };
};

/**
 * מעלה מונה צפיות למיקום.
 */
export const incrementLocationViews = async (locationId) => {
  const response = await axios.post(`${BASE_URL}/${locationId}/view`);
  return response.data;
};

const locationsApi = {
  fetchLocationById,
  addLocation,
  updateLocation,
  deleteLocation,
  fetchLocations,
  fetchUserLocationsPaginated,
  incrementLocationViews,
  searchLocations,
  uploadTempImages
};

export default locationsApi;
