import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

/**
 * מבצע לייק או ביטול לייק לפריט.
 * @param {Object} params - פרמטרים לפעולה.
 * @param {string} params.itemId - ה-ID של הפריט.
 * @param {string} params.userId - ה-ID של המשתמש.
 * @param {string} params.itemType - סוג הפריט ('post', 'location', 'review', 'comment').
 * @param {boolean} params.isLiked - האם הפריט כבר אהוב על ידי המשתמש.
 * @returns {Promise<Object>} - אובייקט המכיל את ה-itemId, סך הלייקים החדש, וסטטוס הלייק החדש.
 */
export const toggleVote = async ({ itemId, userId, itemType, isLiked }) => {
  let response;
  if (isLiked) { // אם כבר אהוב, שלח DELETE כדי לבטל לייק
    response = await axios.delete(`${BASE_URL}/votes/${userId}/${itemType}/${itemId}`);
  } else { // אם לא אהוב, שלח POST כדי להוסיף לייק
    response = await axios.post(`${BASE_URL}/votes`, {
      user_id: userId,
      item_id: itemId,
      item_type: itemType,
    });
  }
  // השרת אמור להחזיר את סך הלייקים החדש
  return { itemId, totalLikes: response.data.totalLikes, newLikedStatus: !isLiked };
};

/**
 * מאחזר את רשימת הפריטים שהמשתמש אהב.
 * @param {string} userId - ה-ID של המשתמש.
 * @returns {Promise<Array<Object>>} - מערך של אובייקטים { itemId, itemType }.
 */
export const fetchUserLikes = async (userId) => {
  const response = await axios.get(`${BASE_URL}/user/${userId}/likes`);
  return response.data;
};

/**
 * מאחזר את ספירות הלייקים הציבוריות עבור מספר פריטים.
 * (זו הפונקציה המקורית, שמאחזרת מפה של לייקים עבור מספר ID-ים).
 * @param {Object} params - פרמטרים לבקשה.
 * @param {Array<string>} params.itemIds - מערך של ID-ים של פריטים.
 * @param {string} params.itemType - סוג הפריט.
 * @returns {Promise<Object>} - מפה { itemId: totalLikes }.
 */
export const fetchPublicLikesCounts = async ({ itemIds, itemType }) => {
  const response = await axios.get(`${BASE_URL}/likes/public-counts`, {
    params: {
      itemIds: itemIds.join(','), // שלח את ה-IDs כסטרינג מופרד בפסיקים
      itemType: itemType
    }
  });
  return response.data; // השרת אמור להחזיר אובייקט כמו { itemId: totalLikes }
};

/**
 * מאחזר את ספירת הלייקים הציבורית עבור פריט בודד.
 * (זו הפונקציה החדשה ש-PlaceDetail.jsx ישתמש בה).
 * @param {Object} params - פרמטרים לבקשה.
 * @param {string} params.itemId - ה-ID של הפריט.
 * @param {string} params.itemType - סוג הפריט.
 * @returns {Promise<number>} - ספירת הלייקים הכוללת (totalLikes).
 */
export const fetchSinglePublicLikeCount = async ({ itemId, itemType }) => { // ✅ פונקציה חדשה
  const response = await axios.get(`${BASE_URL}/votes/${itemType}/${itemId}`);
  return response.data.totalLikes;
};


const likesApi = {
  toggleVote,
  fetchUserLikes,
  fetchPublicLikesCounts, // ✅ נשארת הפונקציה המקורית
  fetchSinglePublicLikeCount, // ✅ נוספת הפונקציה החדשה
};

export default likesApi;
