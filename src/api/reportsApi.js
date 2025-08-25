// import axios from 'axios';

// const BASE_URL = 'http://localhost:3001/api/reports';

// /**
//  * מאחזר את כל הדיווחים מהשרת.
//  * @returns {Promise<Array<Object>>} - מערך של אובייקטי דיווחים.
//  */
// export const fetchReports = async () => {
//   const response = await axios.get(BASE_URL);
//   return response.data;
// };

// /**
//  * מעדכן את הסטטוס של דיווח ספציפי.
//  * @param {string} reportId - ה-ID של הדיווח לעדכון.
//  * @param {string} newStatus - הסטטוס החדש של הדיווח.
//  * @returns {Promise<Object>} - אובייקט הדיווח המעודכן.
//  */
// export const updateReportStatus = async (reportId, newStatus) => {
//   const response = await axios.put(`${BASE_URL}/${reportId}/status`, { status: newStatus });
//   return response.data;
// };

// /**
//  * מוחק דיווח ספציפי מהשרת.
//  * @param {string} reportId - ה-ID של הדיווח למחיקה.
//  * @returns {Promise<string>} - ה-ID של הדיווח שנמחק.
//  */
// export const deleteReport = async (reportId) => {
//   await axios.delete(`${BASE_URL}/${reportId}`);
//   return reportId;
// };

// /**
//  * יוצר דיווח חדש בשרת.
//  * (פונקציה זו נשמרת עבור קריאות קיימות שייתכן ומשתמשות בה).
//  * @param {Object} reportData - נתוני הדיווח.
//  * @param {string} reportData.user_id - ה-ID של המשתמש המדווח.
//  * @param {string} reportData.item_id - ה-ID של הפריט המדווח.
//  * @param {string} reportData.item_type - סוג הפריט המדווח ('post', 'location', 'comment', 'review').
//  * @param {string} reportData.reason - סיבת הדיווח.
//  * @returns {Promise<Object>} - אובייקט הדיווח שנוצר.
//  */
// export const createReport = async (reportData) => {
//   const response = await axios.post(BASE_URL, reportData);
//   return response.data;
// };

// /**
//  * שולח דיווח חדש לשרת.
//  * (פונקציה זו מיועדת לשימוש ב-PlaceDetail ובקומפוננטות דומות).
//  * @param {Object} reportData - נתוני הדיווח.
//  * @param {string} reportData.item_type - סוג הפריט המדווח ('location', 'comment', 'post').
//  * @param {string} reportData.item_id - ה-ID של הפריט המדווח.
//  * @param {string} reportData.user_id - ה-ID של המשתמש המדווח.
//  * @param {string} reportData.reason - סיבת הדיווח.
//  * @returns {Promise<Object>} - תגובת השרת על הדיווח.
//  */
// export const submitReport = async (reportData) => { // ✅ פונקציה חדשה
//   const response = await axios.post(BASE_URL, reportData);
//   return response.data;
// };


// const reportsApi = {
//   fetchReports,
//   updateReportStatus,
//   deleteReport,
//   createReport,  // ✅ שמירה על הפונקציה הקיימת
//   submitReport,  // ✅ הוספת הפונקציה החדשה
// };

// export default reportsApi;
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/reports';

/**
 * מאחזר את כל הדיווחים, עם אפשרות לסינון לפי סוג וסטטוס.
 * @param {string} filterType - סוג הפריט ('post', 'location', 'comment', 'review') או 'all'.
 * @param {string} filterStatus - סטטוס ('pending', 'resolved', 'dismissed') או 'all'.
 * @returns {Promise<Array<Object>>} - מערך של דיווחים מהשרת.
 */
export const fetchReports = async (filterType = 'all', filterStatus = 'all') => {
  const params = new URLSearchParams();
  if (filterType !== 'all') params.append('type', filterType);
  if (filterStatus !== 'all') params.append('status', filterStatus);

  const url = params.toString()
    ? `${BASE_URL}?${params.toString()}`
    : BASE_URL;

  const response = await axios.get(url);
  return response.data;
};

/**
 * מעדכן את הסטטוס של דיווח מסוים.
 * @param {string} reportId - מזהה הדיווח.
 * @param {string} newStatus - הסטטוס החדש.
 * @param {string} [userId] - מזהה המשתמש (לא חובה, אם נדרש ע"י השרת).
 * @returns {Promise<Object>} - אובייקט הדיווח המעודכן.
 */
export const updateReportStatus = async (reportId, newStatus, userId = null) => {
  const body = userId ? { userId, newStatus } : { status: newStatus };
  const response = await axios.put(`${BASE_URL}/${reportId}/status`, body);
  return response.data;
};

/**
 * מוחק דיווח לפי מזהה.
 * @param {string} reportId - מזהה הדיווח למחיקה.
 * @returns {Promise<string>} - ה-ID של הדיווח שנמחק.
 */
export const deleteReport = async (reportId) => {
  await axios.delete(`${BASE_URL}/${reportId}`);
  return reportId;
};

/**
 * יוצר דיווח חדש (לשימוש כללי).
 * @param {Object} reportData - נתוני הדיווח.
 * @returns {Promise<Object>} - הדיווח שנוצר.
 */
export const createReport = async (reportData) => {
  const response = await axios.post(BASE_URL, reportData);
  return response.data;
};

/**
 * שולח דיווח חדש (לשימוש ב-UI).
 * @param {Object} reportData - נתוני הדיווח.
 * @returns {Promise<Object>} - הדיווח שנוצר.
 */
export const submitReport = async (reportData) => {
  const response = await axios.post(BASE_URL, reportData);
  return response.data;
};

/**
 * שליחת דיווח (אלטרנטיבית, שם שונה).
 * @deprecated השתמשו ב-submitReport במקום זאת.
 */
export const reportItem = async (reportData) => {
  return submitReport(reportData);
};

// יצוא מרוכז
const reportsApi = {
  fetchReports,
  updateReportStatus,
  deleteReport,
  createReport,
  submitReport,
  reportItem,
};

export default reportsApi;
