// src/layouts/AuthLayout.jsx
import React, { useState, useEffect, createContext } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase.js'; 
import Header from '../components/Header';
import Footer from '../components/Footer';
import CollageBackground from '../components/CollageBackground'; 
import clearCollageImage from '../assets/collage_with_cloud.png'; 
import { useDispatch } from 'react-redux';
import { setFavorites, clearFavorites } from '../features/posts/favoritesSlice';
import { setUserLikedItems, clearLikesData, fetchUserLikes } from '../features/likes/likesSlice'; 
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; 
import userService from '../api/userService'; // ✅ ייבוא שירות המשתמשים החדש

// יצירת הקונטקסט
export const AuthContext = createContext(null);

// ✅ פונקציית fetchUserProfile הוסרה מכאן - היא נמצאת כעת ב-userService.js


const AuthLayout = () => { 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); 

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true); 
  const [userId, setUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.uid);
        console.log("AuthLayout: Firebase user detected:", user.uid);

        try {
          // אחזר פרטי משתמש מה-backend באמצעות השירות החדש
          const userProfile = await userService.fetchUserById(user.uid); // ✅ שימוש ב-userService
          setCurrentUser(userProfile);
          console.log("AuthLayout: User profile fetched from backend:", userProfile);

          // אחזר לייקים עבור המשתמש באמצעות ה-thunk החדש
          dispatch(fetchUserLikes(user.uid)); 
          console.log("AuthLayout: fetchUserLikes dispatched for userId:", user.uid);

        } catch (error) {
          console.error("AuthLayout: Error fetching user data or likes:", error);
          setCurrentUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        setCurrentUser(null);
        dispatch(clearFavorites());
        dispatch(clearLikesData());
        console.log("AuthLayout: User logged out. Favorites and likes cleared.");
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [dispatch]); 

  // פונקציית התחברות שתשמש לעדכון ה-AuthContext
  const login = async (token, uid, userData = null) => {
    setIsAuthenticated(true);
    setUserId(uid);
    if (userData) {
      setCurrentUser(userData);
      console.log("AuthLayout: Login - User data set from provided payload:", userData);
    } else {
      try {
        const profile = await userService.fetchUserById(uid); // ✅ שימוש ב-userService
        setCurrentUser(profile);
        console.log("AuthLayout: Login - User profile fetched from backend after login:", profile);
      } catch (err) {
        console.error("AuthLayout: Error fetching user profile after login:", err);
        setCurrentUser(null);
      }
    }
    dispatch(fetchUserLikes(uid));
  };

  // פונקציית התנתקות שתשמש לעדכון ה-AuthContext
  const logout = async () => {
    try {
      await signOut(auth); 
      console.log("AuthLayout: Logout initiated.");
    } catch (error) {
      console.error("AuthLayout: Error during Firebase logout:", error);
    }
  };

  // ✅ לוגיקת הגנה על נתיבים - AuthLayout יטפל בהפניה לדף התחברות
  useEffect(() => {
    const protectedRoutes = [
      '/edit-profile', '/admin', '/admin/categories', '/admin/reports',
      '/my-locations', '/my-posts', '/favorites', '/add-place', '/add-post',
      '/my-activity', '/my-drafts', '/admin-dashboard', '/admin/users' 
    ];

    if (!loadingAuth && !isAuthenticated && protectedRoutes.some(route => location.pathname.startsWith(route))) {
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
      navigate('/signin');
    }
  }, [loadingAuth, isAuthenticated, location.pathname, navigate]);


  if (loadingAuth) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-light-beige">
        <svg
          className="w-16 h-16 text-golden-brown animate-pulse" 
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="טוען מיקום"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <p className="ml-3 text-gray-700 mt-4 text-xl font-semibold">טוען את המיקום שלך...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ userId, isAuthenticated, login, logout, currentUser }}>
      <div className="relative flex flex-col min-h-screen bg-light-beige">
        <div className="absolute top-0 left-0 w-full h-[450px] overflow-hidden">
          <CollageBackground />
        </div>

        <div className="relative z-10 flex flex-grow items-center justify-center mt-[20px]">
          <div className="bg-white rounded-none shadow-xl w-full max-w-7xl overflow-hidden flex flex-col min-h-[450px]">
            <Header /> 
            <div
              className="w-full aspect-video max-h-[180px] bg-cover bg-center mt-[-16px]"
              style={{ backgroundImage: `url(${clearCollageImage})` }}
            ></div>
            <main className="flex-grow flex items-center justify-center py-4 px-8">
              <Outlet /> 
            </main>
          </div>
        </div>

        <Footer className="mt-auto py-2" /> 
      </div>
    </AuthContext.Provider>
  );
};

export default AuthLayout;