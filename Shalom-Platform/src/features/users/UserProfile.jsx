// export default UserProfile;
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// ✅ נסיר את הייבוא של fetchUserById ו-clearUser מ-userSlice
// כי נשתמש ישירות בסלקטורים וב-userService
import { clearUser, selectCurrentUserProfile, selectUserStatus, selectUserError } from './userSlice';
import { useParams } from 'react-router-dom';
import PostList from '../posts/PostList';
import LocationList from '../locations/LocationList';
import { FileText, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import userService from '../../api/userService'; // ✅ ייבוא שירות המשתמשים

const UserProfile = () => {
  const { uid } = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('posts');

  // ✅ נשתמש בסלקטורים הקיימים מ-userSlice כדי לקבל את המידע
  const user = useSelector(selectCurrentUserProfile);
  const userLoading = useSelector(selectUserStatus) === 'pending'; // או 'loading' בהתאם לסטטוס שמוגדר לך
  const userError = useSelector(selectUserError);

  useEffect(() => {
    // ✅ קוראים ישירות לפונקציה מ-userService
    const loadUserProfile = async () => {
      try {
        // אין צורך ב-dispatch של thunk כאן, כי אנחנו מטפלים בטעינה ישירות
        const profileData = await userService.fetchUserById(uid);
        // נצטרך דרך לעדכן את ה-userProfile ב-Redux state
        // אם userProfile הוא חלק מה-state של userSlice
        // ייתכן שתצטרך ליצור action חדש ב-userSlice כמו `setUserProfile`
        // או להשתמש ב-dispatch(fetchUserById(uid)) אם אתה רוצה שה-thunk ינהל את זה.
        // מכיוון שה-thunk כבר קיים, עדיף להשתמש בו כדי לשמור על עקביות.
        dispatch(fetchUserById(uid)); 
      } catch (error) {
        console.error("Failed to load user profile directly:", error);
        // טיפול בשגיאה
      }
    };

    loadUserProfile();
    return () => dispatch(clearUser());
  }, [dispatch, uid]);

  const tabs = [
    { name: 'Posts', key: 'posts', icon: FileText },
    { name: 'Locations', key: 'locations', icon: MapPin }
  ];

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <svg className="animate-spin h-10 w-10 text-cyan-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  if (userError) { // ✅ טיפול בשגיאה
    return <p className="text-center text-red-500 mt-6">Error loading user profile: {userError}</p>;
  }

  if (!user) {
    return <p className="text-center text-gray-500 mt-6">User not found</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
            alt="avatar"
            className="w-16 h-16 rounded-full shadow-md"
          />
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map(({ name, key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === key
                ? 'border-cyan-600 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-cyan-600'
            }`}
          >
            <Icon size={18} />
            {name}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'posts' ? (
            <PostList creatorId={uid} /> 
            //{/* ✅ שינוי מ-userId ל-creatorId */}
          ) : (
            <LocationList creatorId={uid} />
            // {/* ✅ שינוי מ-userId ל-creatorId */}
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
