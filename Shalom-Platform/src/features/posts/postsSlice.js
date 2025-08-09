import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import postsApi from '../../api/postsApi'; // ייבוא שירות ה-API החדש לפוסטים

// Thunk to create a new post
export const addPost = createAsyncThunk(
  'posts/addPost',
  async (postData, { rejectWithValue }) => {
    try {
      const data = await postsApi.addPost(postData); // קריאה דרך postsApi
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Error occurred while adding the post');
    }
  }
);

// Thunk to fetch posts with pagination and optional userId filter
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page = 1, userId, category_id }, { rejectWithValue }) => {
    try {
      const data = await postsApi.fetchPosts({ page, userId, category_id }); // קריאה דרך postsApi
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch posts');
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    loading: false,
    error: null,
    success: false,
    page: 1,
    hasMore: true,
  },
  reducers: {
    clearPostStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    resetPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add post
      .addCase(addPost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.loading = false;
        (state.posts ??= []).unshift(action.payload);
        state.success = true;
      })
      .addCase(addPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Post creation failed';
        state.success = false;
      })

      // Fetch posts with pagination and optional userId filter
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          state.posts = action.payload.items;
        } else {
          state.posts = [...state.posts, ...action.payload.items];
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch posts';
      });
  },
});


const selectPostsState = (state) => state.posts;

export const selectAllPosts = createSelector(
  [selectPostsState],
  (postsState) => [...postsState.posts]
);
export const selectPostsLoading = (state) => state.posts.loading;
export const selectPostsError = (state) => state.posts.error;
export const selectPostsPage = (state) => state.posts.page;
export const selectHasMorePosts = (state) => state.posts.hasMore;

export const { clearPostStatus, resetPosts } = postsSlice.actions;
export default postsSlice.reducer;
