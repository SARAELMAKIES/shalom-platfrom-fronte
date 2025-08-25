// src/features/posts/favoritesSlice.js

import { createSlice } from '@reduxjs/toolkit';
// ✅ הוסר createSelector ו-current מכיוון שאינם נחוצים יותר לאור התיקונים
// import { createSelector } from 'reselect'; 
// import { current } from '@reduxjs/toolkit'; 

// פונקציית עזר לטעינת מועדפים מ-localStorage
const loadFavoritesFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('userFavorites'); // שם ייחודי ל-localStorage
    if (serializedState === null) {
      console.log("FavoritesSlice: No 'userFavorites' found in localStorage. Returning empty object.");
      return {}; // אם אין נתונים, החזר אובייקט ריק
    }
    const parsedState = JSON.parse(serializedState);
    console.log("FavoritesSlice: Successfully loaded favorites from localStorage on init:", parsedState);
    return parsedState;
  } catch (e) {
    console.warn("FavoritesSlice: Could not load favorites from local storage", e);
    return {};
  }
};

// פונקציית עזר לשמירת מועדפים ל-localStorage
const saveFavoritesToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('userFavorites', serializedState); // שם ייחודי ל-localStorage
    console.log("FavoritesSlice: Successfully saved favorites to localStorage:", state);
    // ✅ בדיקה מיידית כדי לוודא שהערך נשמר
    const verifySaved = localStorage.getItem('userFavorites');
    console.log("FavoritesSlice: Verification - Value in localStorage after save:", verifySaved);

  } catch (e) {
    console.warn("FavoritesSlice: Could not save favorites to local storage", e);
  }
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    favorites: loadFavoritesFromLocalStorage(), 
  },
  reducers: {
    toggleFavorite: (state, action) => {
      const itemId = action.payload;
      if (state.favorites[itemId]) {
        delete state.favorites[itemId];
        console.log(`FavoritesSlice: Removed item ${itemId} from favorites.`);
      } else {
        state.favorites[itemId] = true;
        console.log(`FavoritesSlice: Added item ${itemId} to favorites.`);
      }
      // ✅ אין צורך ב-current() כאן, state.favorites הוא כבר אובייקט JS רגיל בתוך Redux Toolkit reducer
      saveFavoritesToLocalStorage(state.favorites);
    },
    setFavorites: (state, action) => {
      const newFavoritesMap = {};
      action.payload.forEach(fav => {
        if (fav.itemId) {
          newFavoritesMap[fav.itemId] = true;
        }
      });
      state.favorites = newFavoritesMap;
      // ✅ newFavoritesMap הוא כבר אובייקט JS רגיל, אין צורך ב-current()
      saveFavoritesToLocalStorage(newFavoritesMap);
      console.log("FavoritesSlice: Set favorites from payload:", newFavoritesMap);
    },
    clearFavorites: (state) => {
      state.favorites = {};
      localStorage.removeItem('userFavorites');
      console.log("FavoritesSlice: Cleared all favorites from state and localStorage.");
    },
  },
});

export const { toggleFavorite, setFavorites, clearFavorites } = favoritesSlice.actions;
// ✅ תיקון: סלקטור פשוט יותר, אין צורך ב-createSelector אם אין טרנספורמציה
export const selectFavorites = (state) => state.favorites.favorites;

export default favoritesSlice.reducer;
