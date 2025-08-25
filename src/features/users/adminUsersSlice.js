// src/features/users/adminUsersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminApi from '../../api/adminApi'; // ייבוא שירות ה-API החדש לאדמין

// שינוי: ה-thunk מקבל כעת userId כארגומנט
export const fetchAdminUsers = createAsyncThunk(
  'adminUsers/fetchAll',
  async (userId, { rejectWithValue }) => { // הוספתי rejectWithValue
    try {
      const data = await adminApi.fetchAdminUsers(userId); // קריאה דרך adminApi
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin users'); // שימוש ב-action.payload
    }
  }
);

const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState: {
    items: [],
    loading: false,
    error: null,
    query: '',
  },
  reducers: {
    setSearchQuery(state, action) {
      state.query = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch admin users'; // שימוש ב-action.payload
      });
  },
});

export const { setSearchQuery } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
