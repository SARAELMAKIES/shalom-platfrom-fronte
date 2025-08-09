// src/features/reports/reportsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportsApi from '../../api/reportsApi'; // ייבוא reportsApi
import reviewsApi from '../../api/reviewsApi'; // ייבוא reviewsApi
import postsApi from '../../api/postsApi';   // ייבוא postsApi
import locationsApi from '../../api/locationsApi'; // ייבוא locationsApi

// פעולת Thunk לאחזור דיווחים מהשרת
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (_, { rejectWithValue }) => {
    try {
      const data = await reportsApi.fetchReports(); // קריאה דרך reportsApi
      return data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch reports');
    }
  }
);

// פעולת Thunk לעדכון סטטוס דיווח
export const updateReportStatus = createAsyncThunk(
  'reports/updateReportStatus',
  async ({ reportId, newStatus }, { rejectWithValue }) => {
    try {
      const data = await reportsApi.updateReportStatus(reportId, newStatus); // קריאה דרך reportsApi
      return data;
    } catch (error) {
      console.error('Error updating report status:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to update report status');
    }
  }
);

// פעולת Thunk למחיקת דיווח
export const deleteReport = createAsyncThunk(
  'reports/deleteReport',
  async (reportId, { rejectWithValue }) => {
    try {
      const data = await reportsApi.deleteReport(reportId); // קריאה דרך reportsApi
      return data; // נחזיר את ה-ID של הדיווח שנמחק
    } catch (error) {
      console.error('Error deleting report:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to delete report');
    }
  }
);

// פעולת Thunk למחיקת תוכן מדווח (ביקורת/פוסט/מיקום)
export const deleteReportedContent = createAsyncThunk(
  'reports/deleteReportedContent',
  async ({ type, itemId }, { rejectWithValue }) => {
    try {
      if (type === 'review') {
        await reviewsApi.deleteReview(itemId); // קריאה דרך reviewsApi
      } else if (type === 'post') {
        await postsApi.deletePost(itemId); // קריאה דרך postsApi
      } else if (type === 'location') { // הוספתי טיפול במחיקת מיקום
        await locationsApi.deleteLocation(itemId); // קריאה דרך locationsApi
      } else {
        throw new Error('Unsupported content type for deletion');
      }
      return { type, itemId }; // נחזיר את סוג ותוכן ה-ID שנמחק
    } catch (error) {
      console.error(`Error deleting ${type} content:`, error);
      return rejectWithValue(error.response?.data?.error || `Failed to delete ${type} content`);
    }
  }
);

// פעולת Thunk לעדכון מידע על מקום - דורש יישום ב-backend
export const updatePlaceInfo = createAsyncThunk(
  'reports/updatePlaceInfo',
  async ({ placeId, updateData }, { rejectWithValue }) => { // הוספתי updateData כארגומנט
    try {
      // כאן תצטרך להגדיר את הלוגיקה לעדכון מידע על מקום.
      // לדוגמה, אם הדיווח הוא על מידע שגוי, ייתכן שתצטרך ממשק עריכה למנהל.
      // כרגע זו רק פעולת דמה.
      console.log(`Updating place info for place ID: ${placeId} with data:`, updateData);
      const responseData = await locationsApi.updatePlaceInfo(placeId, updateData); // קריאה דרך locationsApi
      return responseData;
    } catch (error) {
      console.error('Error updating place info:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to update place info');
    }
  }
);


const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    reports: [],
    loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // ניתן להוסיף כאן reducers סינכרוניים אם יש צורך
  },
  extraReducers: (builder) => {
    builder
      // טיפול ב-fetchReports
      .addCase(fetchReports.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      })
      // טיפול ב-updateReportStatus
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        const updatedReport = action.payload;
        state.reports = state.reports.map((report) =>
          report.id === updatedReport.id ? updatedReport : report
        );
      })
      .addCase(updateReportStatus.rejected, (state, action) => {
        state.error = action.payload;
      })
      // טיפול ב-deleteReport
      .addCase(deleteReport.fulfilled, (state, action) => {
        const deletedReportId = action.payload;
        state.reports = state.reports.filter((report) => report.id !== deletedReportId);
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.error = action.payload;
      })
      // טיפול ב-deleteReportedContent (הצלחה)
      .addCase(deleteReportedContent.fulfilled, (state, action) => {
        console.log(`Content of type ${action.payload.type} with ID ${action.payload.itemId} deleted successfully.`);
        // כאן ניתן להוסיף לוגיקה לעדכון הדיווחים בסטייט אם הדיווח קשור לתוכן שנמחק
        // לדוגמה, למחוק את הדיווחים הקשורים ל-itemId זה
        // state.reports = state.reports.filter(report => report.item_id !== action.payload.itemId);
      })
      .addCase(deleteReportedContent.rejected, (state, action) => {
        state.error = action.payload;
      })
      // טיפול ב-updatePlaceInfo (הצלחה)
      .addCase(updatePlaceInfo.fulfilled, (state, action) => {
        console.log(`Place info updated/marked for review:`, action.payload);
      })
      .addCase(updatePlaceInfo.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const selectAllReports = (state) => state.reports.reports;
export const selectReportsLoading = (state) => state.reports.loading;
export const selectReportsError = (state) => state.reports.error;

export default reportsSlice.reducer;
