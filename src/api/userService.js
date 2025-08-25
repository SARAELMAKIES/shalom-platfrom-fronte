import axios from 'axios';

// כתובת ה-API הבסיסית עבור כל הקריאות
// (כעת כללית יותר, ונוסיף את הנתיב הספציפי לכל פונקציה)
const BASE_URL = 'http://localhost:3001/api';

/**
 * מאחזר את פרטי הפרופיל של משתמש לפי ה-ID שלו.
 * @param {string} userId - ה-ID של המשתמש.
 * @returns {Promise<Object>} - אובייקט המשתמש.
 */
const fetchUserById = async (userId) => {
  // הנתיב המלא יהיה: http://localhost:3001/api/users/:userId
  const response = await axios.get(`${BASE_URL}/users/${userId}`);
  return response.data;
};

/**
 * מאחזר סיכום פעילות של משתמש לפי ה-ID שלו.
 * @param {string} userId - ה-ID של המשתמש.
 * @returns {Promise<Object>} - אובייקט סיכום הפעילות.
 */
const fetchUserActivitySummary = async (userId) => {
  // הנתיב המלא יהיה: http://localhost:3001/api/users/:userId/activity-summary
  const response = await axios.get(`${BASE_URL}/users/${userId}/activity-summary`);
  return response.data;
};

/**
 * מעדכן את פרופיל המשתמש.
 * @param {Object} data - אובייקט המכיל את ה-ID של המשתמש ואת הנתונים לעדכון.
 * @param {string} data.userId - ה-ID של המשתמש לעדכון.
 * @param {Object} data.userData - הנתונים המעודכנים של המשתמש.
 * @returns {Promise<Object>} - אובייקט המשתמש המעודכן.
 */
const updateUserProfile = async ({ userId, userData }) => {
  // הנתיב המלא יהיה: http://localhost:3001/api/users/:userId
  const response = await axios.put(`${BASE_URL}/users/${userId}`, userData);
  return response.data;
};

/**
 * מסנכרן (יוצר או מעדכן) משתמש ב-backend.
 * משמש בדרך כלל לאחר התחברות/הרשמה ב-Firebase כדי לוודא שהמשתמש קיים גם ב-backend שלנו.
 * @param {Object} userData - נתוני המשתמש לסנכרון.
 * @returns {Promise<Object>} - אובייקט המשתתף מה-backend.
 */
const syncUserWithBackend = async (userData) => {
  // הנתיב המלא יהיה: http://localhost:3001/api/users (עבור POST)
  const response = await axios.post(`${BASE_URL}/users`, userData);
  return response.data.user; // מניח שהשרת מחזיר אובייקט עם שדה 'user'
};

/**
 * יוצר משתמש חדש ב-backend.
 * (הערה: פונקציה זו דומה ל-syncUserWithBackend וייתכן שניתן לאחד אותן או להשתמש באחת מהן בלבד בהתאם ללוגיקת הרישום/התחברות שלך).
 * @param {Object} userData - נתוני המשתמש ליצירה.
 * @returns {Promise<Object>} - אובייקט המשתמש שנוצר.
 */
const createBackendUser = async (userData) => {
  // הנתיב המלא יהיה: http://localhost:3001/api/users (עבור POST)
  const response = await axios.post(`${BASE_URL}/users`, userData);
  return response.data; // מניח שהשרת מחזיר את נתוני המשתמש ישירות
};

/**
 * מאחזר את היסטוריית הפעילות של משתמש.
 * @param {string} userId - ה-ID של המשתמש.
 * @returns {Promise<Array<Object>>} - מערך של אובייקטי פעילות.
 */
const fetchUserHistory = async (userId) => {
  // הנתיב המלא יהיה: http://localhost:3001/api/user/:userId/history
  const response = await axios.get(`${BASE_URL}/user/${userId}/history`);
  return response.data;
};


// ייצוא כל הפונקציות כחלק מאובייקט שירות
const userService = {
  fetchUserById,
  fetchUserActivitySummary,
  updateUserProfile,
  syncUserWithBackend,
  createBackendUser,
  fetchUserHistory,
};

export default userService;
