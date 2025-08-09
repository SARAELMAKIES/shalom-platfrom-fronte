import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import postsApi from '../../api/postsApi'; // ייבוא שירות ה-API החדש לפוסטים

// אין צורך ב-BASE_URL כאן יותר, הוא מנוהל ב-postsApi.js

export const fetchUserPostsPaginated = createAsyncThunk(
  'myPosts/fetchUserPostsPaginated',
  async ({ userId, page = 1, limit = 6 }, { rejectWithValue }) => {
    try {
      // קריאה דרך postsApi
      const data = await postsApi.fetchUserPostsPaginated({ userId, page, limit });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch user posts');
    }
  }
);

const myPostsSlice = createSlice({
  name: 'myPosts',
  initialState: {
    posts: [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true,
  },
  reducers: {
    resetMyPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPostsPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPostsPaginated.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          state.posts = action.payload.items;
        } else {
          // deduplicate
          const existingIds = new Set(state.posts.map(post => post.id));
          const newItems = action.payload.items.filter(post => !existingIds.has(post.id));
          state.posts = [...state.posts, ...newItems];
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchUserPostsPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user posts';
      });
  },
});

const selectMyPostsState = (state) => state.myPosts;
export const selectAllMyPosts = createSelector(
  [selectMyPostsState],
  (myPostsState) => [...myPostsState.posts]
);
export const selectMyPostsStatus = createSelector(
  [selectMyPostsState],
  (myPostsState) => ({
    loading: myPostsState.loading,
    error: myPostsState.error,
    page: myPostsState.page,
    hasMore: myPostsState.hasMore,
  })
);

export const { resetMyPosts } = myPostsSlice.actions;
export default myPostsSlice.reducer;
