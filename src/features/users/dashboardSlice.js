// src/features/users/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminApi from '../../api/adminApi'; // ✅ ייבוא שירות ה-API החדש לאדמין

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => { // ✅ הוספתי rejectWithValue
    try {
      const data = await adminApi.fetchDashboardStats(); // ✅ קריאה דרך adminApi
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchActivityLog = createAsyncThunk(
  'dashboard/fetchActivityLog',
  async (_, { rejectWithValue }) => { // ✅ הוספתי rejectWithValue
    try {
      const data = await adminApi.fetchActivityLog(); // ✅ קריאה דרך adminApi
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity log');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: { posts: 0, locations: 0, reports: 0, users: 0 },
    postStatsByCategory: [],
    activityLog: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
        state.postStatsByCategory = action.payload.postsByCategory;
        state.loading = false;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch dashboard stats'; // ✅ שימוש ב-action.payload
        state.loading = false;
      })
      .addCase(fetchActivityLog.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActivityLog.fulfilled, (state, action) => {
        state.activityLog = action.payload;
        state.loading = false;
      })
      .addCase(fetchActivityLog.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch activity log'; // ✅ שימוש ב-action.payload
        state.loading = false;
      });
  },
});

export default dashboardSlice.reducer;
