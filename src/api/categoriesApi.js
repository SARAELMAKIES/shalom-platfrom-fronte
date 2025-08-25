import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/categories';

/**
 * מאחזר את כל הקטגוריות מהשרת, עם אפשרות סינון לפי סוג.
 * @param {string} [type=''] - סוג הקטגוריה ('location' או 'post').
 * @returns {Promise<Array<Object>>} - מערך של אובייקטי קטגוריות.
 */
export const fetchCategories = async (type = '') => {
  const params = type ? { type } : {};
  const response = await axios.get(BASE_URL, { params });
  return response.data;
};

/**
 * מוסיף קטגוריה חדשה לשרת.
 * @param {Object} categoryData - נתוני הקטגוריה.
 * @param {string} categoryData.name - שם הקטגוריה.
 * @param {string} categoryData.type - סוג הקטגוריה ('location' או 'post').
 * @param {string} categoryData.userId - ה-ID של המשתמש המבצע (אדמין).
 * @returns {Promise<Object>} - אובייקט הקטגוריה שנוצרה.
 */
export const addCategory = async ({ name, type, userId }) => {
  const response = await axios.post(BASE_URL, { name, type, userId });
  return response.data;
};

/**
 * מעדכן קטגוריה קיימת בשרת.
 * @param {Object} categoryData - נתוני הקטגוריה לעדכון.
 * @param {string} categoryData.id - ה-ID של הקטגוריה לעדכון.
 * @param {string} categoryData.name - השם החדש של הקטגוריה.
 * @param {string} categoryData.type - הסוג החדש של הקטגוריה.
 * @param {string} categoryData.userId - ה-ID של המשתמש המבצע (אדמין).
 * @returns {Promise<Object>} - אובייקט הקטגוריה המעודכנת.
 */
export const updateCategory = async ({ id, name, type, userId }) => {
  const response = await axios.put(`${BASE_URL}/${id}`, { name, type, userId });
  return response.data;
};

/**
 * מוחק קטגוריה מהשרת.
 * @param {Object} deleteData - נתוני המחיקה.
 * @param {string} deleteData.id - ה-ID של הקטגוריה למחיקה.
 * @param {string} deleteData.userId - ה-ID של המשתמש המבצע (אדמין).
 * @returns {Promise<Object>} - תגובת השרת (בדרך כלל ריקה עבור 204).
 */
export const deleteCategory = async ({ id, userId }) => {
  const response = await axios.delete(`${BASE_URL}/${id}`, { params: { userId } });
  return response.data;
};

const categoriesApi = {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
};

export default categoriesApi;
