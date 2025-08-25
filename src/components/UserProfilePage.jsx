// src/pages/UserProfilePage.jsx
import React, { useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchUserById, 
  selectCurrentUserProfile, 
  fetchUserActivitySummary, 
  selectUserActivitySummary, 
  selectActivitySummaryStatus, 
  selectActivitySummaryError 
} from '../features/users/userSlice'; 
import { AuthContext } from '../layouts/AuthLayout';
import { FaUser, FaMapMarkerAlt, FaNewspaper, FaHeart, FaCommentAlt } from 'react-icons/fa'; 

const UserProfilePage = () => {
  const { userId: profileUserId } = useParams(); 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext); 

  const userProfile = useSelector(selectCurrentUserProfile); 
  const userActivitySummary = useSelector(selectUserActivitySummary); 
  const loading = useSelector((state) => state.users.loading);
  const error = useSelector((state) => state.users.error);
  const activitySummaryStatus = useSelector(selectActivitySummaryStatus); 
  const activitySummaryError = useSelector(selectActivitySummaryError); 

  useEffect(() => {
    if (profileUserId) {
      console.log(`UserProfilePage: Fetching profile for user ID: ${profileUserId}`);
      dispatch(fetchUserById(profileUserId));
      dispatch(fetchUserActivitySummary(profileUserId)); 
    }
  }, [dispatch, profileUserId]);

  const handleViewUserPosts = (id) => {
    console.log(`UserProfilePage: Navigating to user-posts for ID: ${id}`); // לוג דיבוג
    navigate(`/user-posts/${id}`);
  };

  const handleViewUserLocations = (id) => {
    console.log(`UserProfilePage: Navigating to user-locations for ID: ${id}`); // ✅ לוג דיבוג
    navigate(`/user-locations/${id}`);
  };

  if (loading === 'pending' || !userProfile) {
    return (
      <div className="flex justify-center items-center h-screen pt-16">
        <svg
          className="animate-spin h-10 w-10 text-golden-brown"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <p className="mr-2 text-golden-brown">טוען פרופיל...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 pt-16">
        <p className="text-red-600 text-lg">שגיאה בטעינת הפרופיל: {error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-golden-brown text-white rounded-md hover:bg-golden-brown-dark"
        >
          חזור לדף הבית
        </button>
      </div>
    );
  }

  if (!userProfile || userProfile.id !== profileUserId) {
    return (
      <div className="text-center p-8 pt-16">
        <p className="text-gray-600 text-lg">הפרופיל המבוקש לא נמצא או שגיאה בטעינה.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-golden-brown text-white rounded-md hover:bg-golden-brown-dark"
        >
          חזור לדף הבית
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 font-inter pt-16">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4 text-center">
        {userProfile.name}
      </h2>

      <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-6xl">
            <FaUser />
          </div>
        </div>
        <div className="flex-grow text-center md:text-right">
          <p className="text-xl font-semibold text-gray-800 mb-2">{userProfile.name}</p>
          <p className="text-gray-600 mb-1">אימייל: {userProfile.email}</p>
          {userProfile.city && <p className="text-gray-600 mb-1">עיר: {userProfile.city}</p>}
          {userProfile.phoneNumber && <p className="text-gray-600 mb-1">טלפון: {userProfile.phoneNumber}</p>}
          <p className="text-gray-600 mb-1">תפקיד: {userProfile.role === 'admin' ? 'מנהל מערכת' : 'משתמש רגיל'}</p>
          <p className="text-gray-600 mb-1">הצטרף ב: {new Date(userProfile.created_at).toLocaleDateString('he-IL')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <button
          onClick={() => handleViewUserPosts(profileUserId)}
          className="flex flex-col items-center justify-center p-6 bg-golden-brown text-white rounded-lg shadow-md hover:bg-golden-brown-dark transition-colors duration-200 text-lg font-semibold"
        >
          <FaNewspaper className="text-4xl mb-2" />
          <span>צפייה בפוסטים</span>
        </button>

        <button
          onClick={() => handleViewUserLocations(profileUserId)}
          className="flex flex-col items-center justify-center p-6 bg-golden-brown text-white rounded-lg shadow-md hover:bg-golden-brown-dark transition-colors duration-200 text-lg font-semibold"
        >
          <FaMapMarkerAlt className="text-4xl mb-2" />
          <span>צפייה במיקומים</span>
        </button>
      </div>

      {/* הצגת סיכום פעילות */}
      <div className="mt-8 p-6 bg-white shadow-md rounded-lg border border-gray-200">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">סיכום פעילות</h3>
        {activitySummaryStatus === 'pending' ? (
          <div className="flex justify-center items-center h-20">
            <svg
              className="animate-spin h-8 w-8 text-golden-brown"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Loading activity summary"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <p className="mr-2 text-golden-brown">טוען סיכום פעילות...</p>
          </div>
        ) : activitySummaryError ? (
          <p className="text-red-600">שגיאה בטעינת סיכום הפעילות: {activitySummaryError}</p>
        ) : userActivitySummary ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <p className="flex items-center gap-2"><FaNewspaper className="text-golden-brown" /> <strong>פוסטים שנוצרו:</strong> {userActivitySummary.totalPosts}</p>
            <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-golden-brown" /> <strong>מקומות שנוצרו:</strong> {userActivitySummary.totalLocations}</p>
            <p className="flex items-center gap-2"><FaHeart className="text-red-500" /> <strong>לייקים שהתקבלו:</strong> {userActivitySummary.totalLikesReceived}</p>
            <p className="flex items-center gap-2"><FaCommentAlt className="text-blue-500" /> <strong>תגובות שהתקבלו:</strong> {userActivitySummary.totalCommentsReceived}</p>
          </div>
        ) : (
          <p className="text-gray-700">אין נתוני פעילות זמינים עבור משתמש זה.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
