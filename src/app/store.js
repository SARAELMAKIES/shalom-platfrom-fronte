// ...existing code...
import myPostsReducer from '../features/myPosts/myPostsSlice';
// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import locationReducer from '../features/locations/locationSlice';
import postsReducer from '../features/posts/postsSlice';
import userReducer from '../features/users/userSlice';
import likesReducer, { default as userLikesReducer } from '../features/likes/likesSlice';
import commentsReducer from '../features/comments/commentsSlice';
import dashboardReducer from '../features/users/dashboardSlice';
import adminUsersReducer from '../features/users/adminUsersSlice';
import myLocationsReducer from '../features/myLocations/myLocationsSlice';
import favoritesReducer from '../features/posts/favoritesSlice'; // ✅ ייבוא ה-reducer החדש
import categoriesReducer from '../features/categories/categoriesSlice';

const store = configureStore({
  reducer: {
    users: userReducer,
    locations: locationReducer,
    posts: postsReducer,
    likes: likesReducer,        // נשאר ללייקים ציבוריים
    userLikes: userLikesReducer, // מוסיף את הרדוסר לסטייט הנכון
    comments: commentsReducer,
    dashboard: dashboardReducer,
    adminUsers: adminUsersReducer,
    favorites: favoritesReducer, // ✅ הוספת ה-reducer החדש למועדפים
    categories: categoriesReducer, // ✅ הוספת ה-reducer לקטגוריות
    myLocations: myLocationsReducer,
    myPosts: myPostsReducer,
  },
});

export default store;