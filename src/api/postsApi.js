
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/posts';

/**
 * מוחק פוסט ספציפי מהשרת.
 * @param {string} postId - ה-ID של הפוסט למחיקה.
 * @returns {Promise<string>} - ה-ID של הפוסט שנמחק.
 */
export const deletePost = async (postId) => {
  await axios.delete(`${BASE_URL}/${postId}`);
  return postId;
};

/**
 * יוצר פוסט חדש בשרת עם יצירת FormData ידנית.
 * @param {Object} postData - נתוני הפוסט החדש, כולל קבצי תמונה.
 * @returns {Promise<Object>} - אובייקט הפוסט שנוצר.
 */
export const addPost = async (postData) => {
  const formData = new FormData();
  formData.append('title', postData.title);
  formData.append('content', postData.content || '');
  formData.append('user_id', postData.user_id);
  formData.append('category_id', postData.category_id);
  formData.append('created_at', new Date().toISOString());

  if (postData.location_id) {
    formData.append('location_id', postData.location_id);
  }

  if (postData.images) {
    Array.from(postData.images).forEach(img => {
      formData.append('images', img);
    });
  }

  const response = await axios.post(BASE_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/**
 * יוצר פוסט חדש בשרת עם FormData מוכן.
 * @param {FormData} formData
 * @returns {Promise<Object>}
 */
export const createPost = (formData) => {
  return axios.post(BASE_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * מעדכן פוסט קיים בשרת.
 * @param {string} postId
 * @param {FormData} formData
 * @returns {Promise<Object>}
 */
export const updatePost = (postId, formData) => {
  return axios.put(`${BASE_URL}/${postId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * מאחזר פוסטים עם פגינציה וסינון אופציונלי לפי מזהה משתמש או קטגוריה.
 */
export const fetchPosts = async ({ page = 1, limit = 6, userId, category_id }) => {
  let url = `${BASE_URL}?page=${page}&limit=${limit}`;

  if (userId) {
    url += `&userId=${userId}`;
  }
  if (category_id) {
    url += `&category_id=${category_id}`;
  }

  const response = await axios.get(url);
  return {
    items: response.data.items,
    page,
    hasMore: response.data.hasMore,
  };
};

/**
 * מאחזר פוסט בודד לפי ה-ID שלו.
 */
export const fetchPostById = async (postId) => {
  const response = await axios.get(`${BASE_URL}/${postId}`);
  return response.data;
};

/**
 * שליפה מהירה לפי ID (לשימוש פנימי או קומפוננטות).
 */
export const getPostById = (postId) => {
  return axios.get(`${BASE_URL}/${postId}`);
};

/**
 * מאחזר פוסטים של משתמש ספציפי עם פגינציה.
 */
export const fetchUserPostsPaginated = async ({ userId, page = 1, limit = 6 }) => {
  const response = await axios.get(`${BASE_URL}/user/${userId}?page=${page}&limit=${limit}`);
  return { items: response.data.items, page, hasMore: response.data.hasMore };
};

const postsApi = {
  deletePost,
  addPost,
  createPost,
  updatePost,
  fetchPosts,
  fetchPostById,
  getPostById,
  fetchUserPostsPaginated,
};

export default postsApi;
