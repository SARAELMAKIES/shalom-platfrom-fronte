// src/features/likes/likesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import likesApi from '../../api/likesApi'; // ייבוא שירות ה-API החדש ללייקים

// Async thunk for toggling a vote (like/unlike)
export const toggleVote = createAsyncThunk(
  'likes/toggleVote',
  async ({ itemId, userId, itemType, isLiked }, { rejectWithValue }) => {
    try {
      // קריאה דרך likesApi
      const data = await likesApi.toggleVote({ itemId, userId, itemType, isLiked });
      return data;
    } catch (error) {
      console.error("Error in toggleVote thunk:", error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle vote');
    }
  }
);

// Async thunk for fetching initial user likes (on login/app load)
export const fetchUserLikes = createAsyncThunk(
  'likes/fetchUserLikes',
  async (userId, { rejectWithValue }) => {
    try {
      // קריאה דרך likesApi
      const data = await likesApi.fetchUserLikes(userId);
      return data; // Should be an array of { itemId, itemType }
    } catch (error) {
      console.error("Error in fetchUserLikes thunk:", error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user likes');
    }
  }
);

// Async thunk for fetching public like counts for multiple items
export const fetchPublicLikesCounts = createAsyncThunk(
  'likes/fetchPublicLikesCounts',
  async ({ itemIds, itemType }, { rejectWithValue }) => {
    try {
      // קריאה דרך likesApi
      const data = await likesApi.fetchPublicLikesCounts({ itemIds, itemType });
      return data; // Returns a map like { itemId: totalLikes }
    } catch (error) {
      console.error("Error in fetchPublicLikesCounts thunk:", error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch public like counts');
    }
  }
);


const likesSlice = createSlice({
  name: 'userLikes',
  initialState: {
    userLikedItems: JSON.parse(localStorage.getItem('userLikedItems')) || {}, // { [itemId]: true }
    publicCounts: {}, // { [itemId]: totalLikes }
    loading: 'idle',
    error: null,
  },
  reducers: {
    // Action to set the entire list of liked items (usually on loading from backend)
    setUserLikedItems: (state, action) => {
      const newLikedItemsMap = {};
      action.payload.forEach(like => {
        if (like.itemId) {
          newLikedItemsMap[like.itemId] = true;
        }
      });
      state.userLikedItems = newLikedItemsMap;
      localStorage.setItem('userLikedItems', JSON.stringify(state.userLikedItems));
    },
    // Action to set public like counts for multiple items
    setPublicLikesCounts: (state, action) => {
      state.publicCounts = { ...state.publicCounts, ...action.payload };
    },
    // Action to clear all liked items and public counts (e.g., on logout)
    clearLikesData: (state) => {
      state.userLikedItems = {};
      state.publicCounts = {};
      localStorage.removeItem('userLikedItems');
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle toggleVote fulfilled
      .addCase(toggleVote.fulfilled, (state, action) => {
        const { itemId, totalLikes, newLikedStatus } = action.payload;
        if (newLikedStatus) {
          state.userLikedItems[itemId] = true;
        } else {
          delete state.userLikedItems[itemId];
        }
        state.publicCounts[itemId] = totalLikes; // Update public count
        localStorage.setItem('userLikedItems', JSON.stringify(state.userLikedItems)); // Persist user's likes
      })
      // Handle fetchUserLikes fulfilled
      .addCase(fetchUserLikes.fulfilled, (state, action) => {
        const newLikedItemsMap = {};
        action.payload.forEach(like => {
          if (like.itemId) {
            newLikedItemsMap[like.itemId] = true;
          }
        });
        state.userLikedItems = newLikedItemsMap;
        localStorage.setItem('userLikedItems', JSON.stringify(state.userLikedItems));
      })
      // Handle fetchPublicLikesCounts fulfilled
      .addCase(fetchPublicLikesCounts.fulfilled, (state, action) => {
        state.publicCounts = { ...state.publicCounts, ...action.payload };
      })
      // Handle pending and rejected states (optional, for loading/error indicators)
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = 'pending';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = 'idle';
          state.error = action.payload || 'An error occurred';
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = 'idle';
        }
      );
  },
});

export const { setUserLikedItems, setPublicLikesCounts, clearLikesData } = likesSlice.actions;

// Selectors
export const selectUserLikedItems = (state) => state.userLikes.userLikedItems;
export const selectPublicLikesCounts = (state) => state.userLikes.publicCounts;
export const selectIsLiked = createSelector(
  [selectUserLikedItems, (state, itemId) => itemId],
  (userLikedItems, itemId) => !!userLikedItems[itemId]
);
export const selectTotalLikes = createSelector(
  [selectPublicLikesCounts, (state, itemId) => itemId],
  (publicCounts, itemId) => publicCounts[itemId] || 0
);

export default likesSlice.reducer;
