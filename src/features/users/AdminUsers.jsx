// src/features/users/AdminUsers.jsx
import React, { useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminUsers,
  setSearchQuery,
} from './adminUsersSlice';
import { AuthContext } from '../../layouts/AuthLayout';
import { useNavigate } from 'react-router-dom'; // ✅ ייבוא useNavigate
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa'; // ✅ ייבוא אייקונים לפעולות

const AdminUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ שימוש ב-useNavigate
  const { userId, currentUser, loadingAuth } = useContext(AuthContext);
  const { items, query, loading, error } = useSelector((state) => state.adminUsers);

  useEffect(() => {
    if (!loadingAuth && userId && currentUser?.role === 'admin') {
      console.log("AdminUsers.jsx: Dispatching fetchAdminUsers with userId:", userId);
      dispatch(fetchAdminUsers(userId));
    } else if (!loadingAuth && (!userId || currentUser?.role !== 'admin')) {
      console.log("AdminUsers.jsx: Not authorized or userId not available. User role:", currentUser?.role);
    }
  }, [dispatch, loadingAuth, userId, currentUser]);

  const filtered = items.filter((user) =>
    user.name.toLowerCase().includes(query.toLowerCase()) ||
    user.email.toLowerCase().includes(query.toLowerCase()) ||
    user.id.toLowerCase().includes(query.toLowerCase()) ||
    (user.phoneNumber && user.phoneNumber.toLowerCase().includes(query.toLowerCase())) || // ✅ חיפוש גם לפי מספר טלפון
    (user.city && user.city.toLowerCase().includes(query.toLowerCase())) // ✅ חיפוש גם לפי עיר
  );

  // ✅ פונקציות לטיפול בפעולות על משתמשים
  const handleViewProfile = (id) => {
    console.log(`צפה בפרופיל משתמש: ${id}`);
    navigate(`/profile/${id}`); // ניווט לדף פרופיל המשתמש
  };

  const handleEditUser = (id) => {
    console.log(`ערוך משתמש: ${id}`);
    // כאן תוכל להוסיף לוגיקה לניתוב לדף עריכת משתמש או פתיחת מודאל עריכה
    // לדוגמה: navigate(`/admin/users/edit/${id}`);
  };

  const handleDeleteUser = (id) => {
    console.log(`מחק משתמש: ${id}`);
    // כאן תוכל להוסיף לוגיקה למחיקת משתמש (לדוגמה, בקשת אישור ואז קריאת API)
  };

  if (loadingAuth || !userId || typeof currentUser?.role === 'undefined') {
    return <p className="text-center mt-10 text-gray-500">טוען נתוני משתמשים...</p>;
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="text-center mt-10 text-red-600 text-lg font-semibold">
        אין לך הרשאה לצפות בדף זה.
      </div>
    );
  }

  return (
    <div className="p-4 bg-light-beige min-h-screen"> {/* ✅ רקע בהיר לכל הדף */}
      <h1 className="text-3xl font-bold mb-6 text-golden-brown text-center">ניהול משתמשים</h1> {/* ✅ כותרת מרכזית */}

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 mb-6"> {/* ✅ עוטף את שדה החיפוש */}
        <input
          type="text"
          placeholder="חפש לפי שם, אימייל, ID, טלפון או עיר..." // ✅ טקסט חיפוש מורחב
          value={query}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-golden-brown-light transition duration-200" // ✅ עיצוב משופר
        />
      </div>

      {loading && <p className="text-center text-gray-500">טוען משתמשים...</p>}
      {error && <p className="text-center text-red-500">שגיאה: {error}</p>}

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden"> {/* ✅ עוטף את הטבלה */}
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-golden-brown text-white text-left"> {/* ✅ צבע רקע וטקסט לכותרות */}
              <th className="px-5 py-3 border-b-2 border-golden-brown-dark text-xs font-semibold uppercase tracking-wider rounded-tl-lg">ID</th>
              <th className="px-5 py-3 border-b-2 border-golden-brown-dark text-xs font-semibold uppercase tracking-wider">שם</th>
              <th className="px-5 py-3 border-b-2 border-golden-brown-dark text-xs font-semibold uppercase tracking-wider">אימייל</th>
              <th className="px-5 py-3 border-b-2 border-golden-brown-dark text-xs font-semibold uppercase tracking-wider">תפקיד</th>
              <th className="px-5 py-3 border-b-2 border-golden-brown-dark text-xs font-semibold uppercase tracking-wider">טלפון</th> {/* ✅ עמודה חדשה */}
              <th className="px-5 py-3 border-b-2 border-golden-brown-dark text-xs font-semibold uppercase tracking-wider">עיר</th> {/* ✅ עמודה חדשה */}
              <th className="px-5 py-3 border-b-2 border-golden-brown-dark text-xs font-semibold uppercase tracking-wider">נוצר בתאריך</th> {/* ✅ עמודה חדשה */}
              <th className="px-5 py-3 border-b-2 border-golden-brown-dark text-xs font-semibold uppercase tracking-wider rounded-tr-lg">פעולות</th> {/* ✅ עמודה חדשה */}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500"> {/* ✅ שיניתי colSpan ל-8 */}
                  לא נמצאו משתמשים.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition duration-150 ease-in-out border-b border-gray-200 last:border-b-0"> {/* ✅ עיצוב שורה */}
                  <td className="px-5 py-4 text-sm text-gray-900">{user.id}</td>
                  <td className="px-5 py-4 text-sm text-gray-900">{user.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-900">{user.email}</td>
                  <td className="px-5 py-4 text-sm text-gray-900 capitalize">{user.role}</td> {/* ✅ הצגת תפקיד המשתמש */}
                  <td className="px-5 py-4 text-sm text-gray-900">{user.phoneNumber || 'N/A'}</td> {/* ✅ הצגת טלפון */}
                  <td className="px-5 py-4 text-sm text-gray-900">{user.city || 'N/A'}</td> {/* ✅ הצגת עיר */}
                  <td className="px-5 py-4 text-sm text-gray-900">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'} {/* ✅ הצגת תאריך יצירה */}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <div className="flex items-center space-x-2"> {/* ✅ כפתורי פעולה */}
                      <button
                        onClick={() => handleViewProfile(user.id)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition"
                        title="צפה בפרופיל"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100 transition"
                        title="ערוך משתמש"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition"
                        title="מחק משתמש"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
