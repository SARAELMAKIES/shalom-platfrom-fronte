import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import userService from '../../api/userService'; // ✅ ייבוא הקובץ החדש



// פעולה אסינכרונית לאחזור פרטי משתמש לפי ID
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      // ✅ קוראים לפונקציה מהשירות במקום להשתמש ב-axios ישירות
      const userProfile = await userService.fetchUserById(userId);
      return userProfile;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);

// פעולה אסינכרונית לאחזור סיכום פעילות משתמש
export const fetchUserActivitySummary = createAsyncThunk(
  'users/fetchUserActivitySummary',
  async (userId, { rejectWithValue }) => {
    try {
      // ✅ קוראים לפונקציה מהשירות
      const activitySummary = await userService.fetchUserActivitySummary(userId);
      return activitySummary;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user activity summary');
    }
  }
);


// פעולה אסינכרונית לעדכון פרופיל משתמש
export const updateUserProfile = createAsyncThunk(
  'users/updateUserProfile',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      // ✅ קוראים לפונקציה מהשירות
      const updatedUser = await userService.updateUserProfile({ userId, userData });
      return updatedUser;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update user profile');
    }
  }
);

// פעולה אסינכרונית ליצירה/עדכון משתמש ב-backend (בכניסה)
export const syncUserWithBackend = createAsyncThunk(
  'users/syncUserWithBackend',
  async (userData, { rejectWithValue }) => {
    try {
      // ✅ קוראים לפונקציה מהשירות
      const user = await userService.syncUserWithBackend(userData);
      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to sync user with backend');
    }
  }
);

// שאר הקוד של ה-slice (reducers, extraReducers, selectors) נשאר ללא שינוי
const userSlice = createSlice({
  name: 'users',
  initialState: {
    currentUser: null, 
    userProfile: null, 
    userActivitySummary: null, 
    loading: 'idle',
    error: null,
    status: 'idle', 
    updateStatus: 'idle', 
    activitySummaryStatus: 'idle', 
    activitySummaryError: null, 
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      state.status = 'succeeded';
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
      state.status = 'idle';
      state.userProfile = null; 
      state.userActivitySummary = null; 
    },
    clearUserProfile: (state) => { 
      state.userProfile = null;
      state.userActivitySummary = null; 
    },
    clearUserStatus: (state) => {
      state.status = 'idle';
      state.error = null;
      state.updateStatus = 'idle';
      state.activitySummaryStatus = 'idle'; 
      state.activitySummaryError = null; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncUserWithBackend.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(syncUserWithBackend.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(syncUserWithBackend.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.updateStatus = 'loading';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        state.currentUser = action.payload.user; 
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUserById.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.userProfile = null; 
        state.userActivitySummary = null; 
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.userProfile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
        state.userProfile = null;
        state.userActivitySummary = null; 
      })
      .addCase(fetchUserActivitySummary.pending, (state) => {
        state.activitySummaryStatus = 'pending';
        state.activitySummaryError = null;
        state.userActivitySummary = null;
      })
      .addCase(fetchUserActivitySummary.fulfilled, (state, action) => {
        state.activitySummaryStatus = 'succeeded';
        state.userActivitySummary = action.payload;
        state.activitySummaryError = null;
      })
      .addCase(fetchUserActivitySummary.rejected, (state, action) => {
        state.activitySummaryStatus = 'failed';
        state.activitySummaryError = action.payload;
        state.userActivitySummary = null;
      });
  },
});

export const { setCurrentUser, clearCurrentUser, clearUserStatus, clearUserProfile } = userSlice.actions; 

export const selectCurrentUser = (state) => state.users.currentUser;
export const selectUserStatus = (state) => state.users.status;
export const selectUserError = (state) => state.users.error;
export const selectUserUpdateStatus = (state) => state.users.updateStatus;
export const selectCurrentUserProfile = (state) => state.users.userProfile; 
export const selectUserActivitySummary = (state) => state.users.userActivitySummary; 
export const selectActivitySummaryStatus = (state) => state.users.activitySummaryStatus; 
export const selectActivitySummaryError = (state) => state.users.activitySummaryError; 


export const selectCurrentUserId = createSelector(
  selectCurrentUser,
  (currentUser) => currentUser?.id
);

export default userSlice.reducer;