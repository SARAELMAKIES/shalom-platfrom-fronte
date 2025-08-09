import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import commentsApi from '../../api/commentsApi'; // ייבוא שירות ה-API החדש לתגובות

// שליפת תגובות לפי פריט
export const fetchCommentsByItem = createAsyncThunk(
  'comments/fetchByItem',
  async ({ item_id, item_type }, { rejectWithValue }) => {
    try {
      // קריאה דרך commentsApi
      const comments = await commentsApi.fetchCommentsByItem({ item_id, item_type });
      return { item_id, item_type, comments };
    } catch (error) {
      console.error("Error in fetchCommentsByItem thunk:", error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

// הוספת תגובה חדשה (כולל תגובה לתגובה)
export const addComment = createAsyncThunk(
  'comments/add',
  async ({ item_id, item_type, user_id, content, parent_id = null }, { rejectWithValue }) => {
    try {
      // קריאה דרך commentsApi
      const data = await commentsApi.addComment({
        item_id,
        item_type,
        user_id,
        content,
        parent_id,
      });
      return data; // מחזיר את התגובה בלבד
    } catch (error) {
      console.error("Error in addComment thunk:", error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    byItem: {}, // מבנה: { 'post-123': [...] }
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearCommentsStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentsByItem.fulfilled, (state, action) => {
        const key = `${action.payload.item_type}-${action.payload.item_id}`;
        state.byItem[key] = action.payload.comments;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        // שלוף את הנתונים המקוריים מתוך הבקשה
        const { item_type, item_id } = action.meta.arg;
        const key = `${item_type}-${item_id}`;

        if (!state.byItem[key]) state.byItem[key] = [];

        const newComment = {
          ...action.payload,
          item_type,
          item_id,
        };

        state.byItem[key].push(newComment);
        state.success = true;
      })
      .addCase(fetchCommentsByItem.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchCommentsByItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch comments';
        state.success = false;
      })
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add comment';
        state.success = false;
      });
  },
});

// סלקטור לשימוש ברכיב
export const makeSelectCommentsByItem = (item_type, item_id) =>
  createSelector(
    (state) => state.comments.byItem,
    (byItem) => byItem[`${item_type}-${item_id}`] || []
  );

export const { clearCommentsStatus } = commentsSlice.actions;
export default commentsSlice.reducer;
