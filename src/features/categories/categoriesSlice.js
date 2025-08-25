// src/features/categories/categorySlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import categoriesApi from '../../api/categoriesApi'; // ייבוא שירות ה-API החדש לקטגוריות

// פעולה אסינכרונית לאחזור כל הקטגוריות
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (type = '', { rejectWithValue }) => { // type יכול להיות 'location' או 'post'
    try {
      const data = await categoriesApi.fetchCategories(type); // קריאה דרך categoriesApi
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// פעולה אסינכרונית להוספת קטגוריה (דורש הרשאת אדמין)
export const addCategory = createAsyncThunk(
  'categories/addCategory',
  async ({ name, type, userId }, { rejectWithValue }) => {
    try {
      const data = await categoriesApi.addCategory({ name, type, userId }); // קריאה דרך categoriesApi
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to add category');
    }
  }
);

// פעולה אסינכרונית לעדכון קטגוריה (דורש הרשאת אדמין)
export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, name, type, userId }, { rejectWithValue }) => {
    try {
      const data = await categoriesApi.updateCategory({ id, name, type, userId }); // קריאה דרך categoriesApi
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to update category');
    }
  }
);

// פעולה אסינכרונית למחיקת קטגוריה (דורש הרשאת אדמין)
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      // שליחת userId כ-query parameter עבור בדיקת הרשאות בשרת
      const data = await categoriesApi.deleteCategory({ id, userId }); // קריאה דרך categoriesApi
      return { id, data }; // החזר את ה-ID כדי שתוכל למחוק אותו מהסטייט
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to delete category');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    allCategories: [], // כל הקטגוריות
    locationCategories: [], // קטגוריות מסוג 'location'
    postCategories: [], // קטגוריות מסוג 'post'
    loading: 'idle', // שינוי ל-idle כדי להתאים לסטנדרט Redux Toolkit
    error: null,
    status: 'idle', // סטטוס כללי לפעולות (נוסף)
  },
  reducers: {
    // ניתן להוסיף reducers סינכרוניים אם צריך
    clearCategoryStatus: (state) => { // נוסף reducer לניקוי סטטוס
      state.status = 'idle';
      state.loading = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // טיפול ב-fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = 'pending'; // שינוי ל-pending
        state.error = null;
        state.status = 'loading'; // עדכון סטטוס כללי
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = 'succeeded'; // שינוי ל-succeeded
        state.status = 'succeeded'; // עדכון סטטוס כללי
        state.allCategories = action.payload;
        // פילטור לקטגוריות ספציפיות לפי type
        state.locationCategories = action.payload.filter(cat => cat.type === 'location');
        state.postCategories = action.payload.filter(cat => cat.type === 'post');
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = 'failed'; // שינוי ל-failed
        state.status = 'failed'; // עדכון סטטוס כללי
        state.error = action.payload || 'Failed to fetch categories'; // שימוש ב-action.payload לשגיאה
      })

      // טיפול ב-addCategory (נוסף)
      .addCase(addCategory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allCategories.push(action.payload);
        if (action.payload.type === 'location') {
          state.locationCategories.push(action.payload);
        } else if (action.payload.type === 'post') {
          state.postCategories.push(action.payload);
        }
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to add category';
      })

      // טיפול ב-updateCategory (נוסף)
      .addCase(updateCategory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.allCategories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.allCategories[index] = action.payload;
        }
        // עדכון הרשימות הספציפיות
        state.locationCategories = state.allCategories.filter(cat => cat.type === 'location');
        state.postCategories = state.allCategories.filter(cat => cat.type === 'post');
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to update category';
      })

      // טיפול ב-deleteCategory (נוסף)
      .addCase(deleteCategory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // ה-id של הקטגוריה נמצא ב-action.meta.arg.id
        state.allCategories = state.allCategories.filter(cat => cat.id !== action.meta.arg.id);
        state.locationCategories = state.allCategories.filter(cat => cat.type === 'location');
        state.postCategories = state.allCategories.filter(cat => cat.type === 'post');
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to delete category';
      });
  },
});

export const { clearCategoryStatus } = categorySlice.actions; // ייצוא clearCategoryStatus

// סלקטורים (נוספו/עודכנו)
export const selectAllCategories = createSelector(
  (state) => state.categories.allCategories,
  (allCategories) => allCategories
);

export const selectLocationCategories = createSelector(
  (state) => state.categories.locationCategories,
  (locationCategories) => locationCategories
);

export const selectPostCategories = createSelector(
  (state) => state.categories.postCategories,
  (postCategories) => postCategories
);

export const selectCategoriesLoading = createSelector(
  (state) => state.categories.loading,
  (loading) => loading
);

export const selectCategoriesError = createSelector(
  (state) => state.categories.error,
  (error) => error
);

export default categorySlice.reducer;
