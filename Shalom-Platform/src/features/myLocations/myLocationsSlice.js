import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import locationsApi from '../../api/locationsApi'; // ייבוא שירות ה-API החדש למיקומים

// אין צורך ב-BASE_URL כאן יותר, הוא מנוהל ב-locationsApi.js

export const fetchUserLocationsPaginated = createAsyncThunk(
  'myLocations/fetchUserLocationsPaginated',
  async ({ userId, page = 1, limit = 6 }, { rejectWithValue }) => {
    try {
      // קריאה דרך locationsApi
      const data = await locationsApi.fetchUserLocationsPaginated({ userId, page, limit });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch user locations');
    }
  }
);

const myLocationsSlice = createSlice({
  name: 'myLocations',
  initialState: {
    locations: [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true,
  },
  reducers: {
    resetMyLocations: (state) => {
      state.locations = [];
      state.page = 1;
      state.hasMore = true;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserLocationsPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserLocationsPaginated.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          state.locations = action.payload.items;
        } else {
          // deduplicate
          const existingIds = new Set(state.locations.map(loc => loc.id));
          const newItems = action.payload.items.filter(loc => !existingIds.has(loc.id));
          state.locations = [...state.locations, ...newItems];
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchUserLocationsPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user locations';
      });
  },
});

const selectMyLocationsState = (state) => state.myLocations;
export const selectAllMyLocations = createSelector(
  [selectMyLocationsState],
  (myLocationsState) => Array.isArray(myLocationsState.locations) ? [...myLocationsState.locations] : []
);
export const selectMyLocationsStatus = createSelector(
  [selectMyLocationsState],
  (myLocationsState) => ({
    loading: myLocationsState.loading,
    error: myLocationsState.error,
    page: myLocationsState.page,
    hasMore: myLocationsState.hasMore,
  })
);

export const { resetMyLocations } = myLocationsSlice.actions;
export default myLocationsSlice.reducer;
