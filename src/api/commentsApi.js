import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/comments';

/**
 * מאחזר תגובות לפוסט ספציפי.
 * @param {string} postId - ה-ID של הפוסט שעבורו יש לאחזר תגובות.
 * @returns {Promise<Array<Object>>} - מערך של אובייקטי תגובות.
 */
export const fetchCommentsForPost = async (postId) => {
  const response = await axios.get(`${BASE_URL}/post/${postId}`);
  return response.data;
};

/**
 * מאחזר תגובות לפי סוג פריט ו-ID.
 * @param {Object} params - פרמטרים לבקשה.
 * @param {string} params.item_id - ה-ID של הפריט (פוסט, מיקום וכו').
 * @param {string} params.item_type - סוג הפריט ('post', 'location').
 * @returns {Promise<Array<Object>>} - מערך של אובייקטי תגובות.
 */
export const fetchCommentsByItem = async ({ item_id, item_type }) => {
  const response = await axios.get(`${BASE_URL}/${item_type}/${item_id}`);
  return response.data;
};


/**
 * מוסיף תגובה חדשה לפוסט או כתגובה לתגובה קיימת.
 * @param {Object} commentData - נתוני התגובה.
 * @param {string} commentData.item_id - ה-ID של הפוסט/פריט שאליו מתייחסת התגובה.
 * @param {string} commentData.item_type - סוג הפריט (לדוגמה: 'post').
 * @param {string} commentData.user_id - ה-ID של המשתמש שכתב את התגובה.
 * @param {string} commentData.content - תוכן התגובה.
 * @param {string|null} [commentData.parent_id=null] - ה-ID של תגובת האב, אם זו תגובת שרשור.
 * @returns {Promise<Object>} - אובייקט התגובה שנוצרה.
 */
export const addComment = async (commentData) => {
  const response = await axios.post(BASE_URL, commentData);
  return response.data;
};

const commentsApi = {
  fetchCommentsForPost,
  fetchCommentsByItem,
  addComment,
};

export default commentsApi;
