import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/admin';

/**
 * מאחזר נתונים סטטיסטיים עבור לוח המחוונים של האדמין.
 * @returns {Promise<Object>} - אובייקט המכיל סטטיסטיקות שונות.
 */
const fetchDashboardStats = async () => {
  const response = await axios.get(`${BASE_URL}/stats`);
  return response.data;
};

/**
 * מאחזר את יומן הפעילות (Activity Log) עבור לוח המחוונים של האדמין.
 * @returns {Promise<Array<Object>>} - מערך של אובייקטי יומן פעילות.
 */
const fetchActivityLog = async () => {
  const response = await axios.get(`${BASE_URL}/activity-log`);
  return response.data;
};

/**
 * מאחזר רשימת משתמשים עבור לוח המחוונים של האדמין.
 * @param {string} userId - ה-ID של המשתמש המבצע את הבקשה (אדמין).
 * @returns {Promise<Array<Object>>} - מערך של אובייקטי משתמשים.
 */
const fetchAdminUsers = async (userId) => {
  const response = await axios.get(`${BASE_URL}/users?userId=${userId}`);
  return response.data;
};


// ייצוא כל הפונקציות כחלק מאובייקט שירות
const adminApi = {
  fetchDashboardStats,
  fetchActivityLog,
  fetchAdminUsers, // ✅ הוספתי את הפונקציה החדשה
};

export default adminApi;
