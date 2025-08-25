import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats, fetchActivityLog } from './dashboardSlice';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AuthContext } from '../../layouts/AuthLayout';
import { FaMapMarkerAlt, FaRegNewspaper, FaUserAlt, FaFlag, FaListAlt, FaChartBar } from 'react-icons/fa';
import adminApi from '../../api/adminApi'; // ✅ ייבוא שירות ה-API החדש לאדמין


const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-lg shadow-md p-4 text-center">
    <Icon className={`mx-auto text-2xl ${color}`} />
    <h3 className="text-lg font-semibold">{label}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const ButtonLink = ({ to, children, icon: Icon }) => (
  <Link
    to={to}
    className="border border-gray-400 rounded px-4 py-2 inline-flex items-center hover:bg-gray-100 transition"
  >
    {Icon && <Icon className="mr-2" />}
    {children}
  </Link>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId, currentUser, loadingAuth } = useContext(AuthContext);

  const { stats, activityLog, postStatsByCategory, loading, error } = useSelector(state => state.dashboard);

  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(true);
  const [errorAdminUsers, setErrorAdminUsers] = useState(null);

  useEffect(() => {
    if (loadingAuth || !currentUser || typeof currentUser.role === 'undefined') {
      console.log("AdminDashboard useEffect: Auth still loading or currentUser not fully defined.", { loadingAuth, currentUser });
      return;
    }

    if (currentUser.role !== 'admin') {
      console.log("AdminDashboard: User not authorized. Current role:", currentUser.role, "Redirecting to home.");
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);
      return () => clearTimeout(timer);
    }

    const fetchAdminUsersData = async () => { // ✅ שינוי שם הפונקציה כדי למנוע התנגשות עם ה-thunk
      setLoadingAdminUsers(true);
      setErrorAdminUsers(null);
      console.log("AdminDashboard: Attempting to fetch admin users. userId:", userId, "currentUser.role:", currentUser.role);
      try {
        // ✅ קריאה דרך adminApi
        const responseData = await adminApi.fetchAdminUsers(userId);
        setAdminUsers(responseData);
        console.log("AdminDashboard: Successfully fetched admin users.");
      } catch (err) {
        console.error('AdminDashboard: Failed to fetch admin users:', err);
        setErrorAdminUsers('Failed to load users. Please ensure you are logged in as an admin.');
      } finally {
        setLoadingAdminUsers(false);
      }
    };

    if (userId) {
      fetchAdminUsersData(); // ✅ קריאה לפונקציה המעודכנת
    } else {
      console.log("AdminDashboard: userId is null, cannot fetch admin users.");
    }
  }, [loadingAuth, currentUser, userId, navigate]);

  useEffect(() => {
    if (!loadingAuth && currentUser?.role === 'admin') {
      console.log("AdminDashboard: Fetching general dashboard stats and activity log.");
      dispatch(fetchDashboardStats());
      dispatch(fetchActivityLog());
    }
  }, [dispatch, loadingAuth, currentUser]);


  if (loadingAuth || !currentUser || typeof currentUser.role === 'undefined') {
    return <p className="text-center mt-10 text-gray-500">טוען דאשבורד מנהל...</p>;
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="text-center mt-10 text-red-600 text-lg font-semibold">
        אין לך הרשאה לצפות בדף זה. מנתב לדף הבית...
      </div>
    );
  }

  if (loading || loadingAdminUsers) return <p className="text-center text-gray-500">Loading dashboard data...</p>;
  if (error) return <p className="text-center text-red-500">Error loading dashboard stats: {error}</p>;
  if (errorAdminUsers) return <p className="text-center text-red-500">Error loading admin users: {errorAdminUsers}</p>;


  return (
    <div className="p-4 grid gap-6 pt-16">
      <h1 className="text-3xl font-bold mb-4 text-golden-brown">פאנל ניהול</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FaRegNewspaper} label="Posts" value={stats.posts} color="text-blue-500" />
        <StatCard icon={FaMapMarkerAlt} label="Locations" value={stats.locations} color="text-green-500" />
        <StatCard icon={FaFlag} label="Reports" value={stats.reports} color="text-red-500" />
        <StatCard icon={FaUserAlt} label="Users" value={stats.users} color="text-purple-500" />
      </div>

      {/* Graph section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold mb-2">Posts by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={postStatsByCategory}>
              <XAxis dataKey="category" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity log */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-2">Recent Activity</h3>
        <ul className="list-disc pl-4 space-y-1 text-sm">
          {activityLog.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>

      {/* ✅ סעיף חדש: רשימת משתמשים (לצורך ניהול) */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-2">ניהול משתמשים</h3>
        {adminUsers.length === 0 ? (
          <p className="text-gray-500">לא נמצאו משתמשים.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {adminUsers.map(user => (
              <li key={user.id} className="py-2 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{user.name} ({user.email})</p>
                  <p className="text-sm text-gray-500">Role: {user.role}</p>
                </div>
                {/* כאן ניתן להוסיף כפתורי עריכה/מחיקה למשתמשים */}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-4">
        {/* הוספת אייקונים לכפתורים */}
        {/* ✅ וודא ש-userId נשלח בקישורים לדפי הניהול אם הם דורשים זאת */}
        <ButtonLink to={`/admin/categories?userId=${userId}`} icon={FaListAlt}>Manage Categories</ButtonLink>
        <ButtonLink to={`/admin/reports?userId=${userId}`} icon={FaFlag}>Manage Reports</ButtonLink>
        <ButtonLink to={`/admin/users?userId=${userId}`} icon={FaUserAlt}>Manage Users</ButtonLink>
      </div>
    </div>
  );
};

export default AdminDashboard;
