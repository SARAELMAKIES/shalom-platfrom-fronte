// src/features/locations/locationSlice.jsx
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import locationsApi from '../../api/locationsApi'; // ייבוא שירות ה-API החדש למיקומים

// פעולה אסינכרונית לקבלת מקום בודד לפי id
export const fetchLocationById = createAsyncThunk(
  'locations/fetchLocationById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await locationsApi.fetchLocationById(id); // קריאה דרך locationsApi
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch location');
    }
  }
);

// פעולה אסינכרונית להוספת מקום
export const addLocation = createAsyncThunk(
  'locations/addLocation',
  async (locationData, { rejectWithValue }) => {
    try {
      const data = await locationsApi.addLocation(locationData); // קריאה דרך locationsApi
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to add location');
    }
  }
);

// פעולה אסינכרונית לעדכון מקום
export const updateLocation = createAsyncThunk(
  'locations/updateLocation',
  async ({ id, locationData }, { rejectWithValue }) => {
    try {
      const data = await locationsApi.updateLocation({ id, locationData }); // קריאה דרך locationsApi
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update location');
    }
  }
);

// פעולה אסינכרונית למחיקת מקום
export const deleteLocation = createAsyncThunk(
  'locations/deleteLocation',
  async ({ id, userId, role }, { rejectWithValue }) => {
    try {
      const data = await locationsApi.deleteLocation({ id, userId, role }); // קריאה דרך locationsApi
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to delete location');
    }
  }
);

// פעולה אסינכרונית לקבלת רשימת מקומות
export const fetchLocations = createAsyncThunk(
  'locations/fetchLocations',
  async ({ page = 1, limit = 6, userId = undefined, category_id = '' }, { rejectWithValue }) => {
    try {
      const data = await locationsApi.fetchLocations({ page, limit, userId, category_id }); // קריאה דרך locationsApi
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch locations');
    }
  }
);

const locationSlice = createSlice({
  name: 'locations',
  initialState: {
    locations: [],
    loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    error: null,
    page: 1,
    hasMore: true,
    currentLocation: null,
    success: null,
  },
  reducers: {
    resetLocations: (state) => {
      state.locations = [];
      state.page = 1;
      state.hasMore = true;
      state.loading = 'idle';
      state.error = null;
      state.success = null;
    },
    clearStatus: (state) => {
      state.loading = 'idle';
      state.error = null;
      state.success = null;
    },
    clearLocationStatus: (state) => {
      state.currentLocation = null;
      state.loading = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // טיפול ב-addLocation
      .addCase(addLocation.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.success = null;
      })
      .addCase(addLocation.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.locations.push(action.payload);
        state.success = 'Location added successfully';
      })
      .addCase(addLocation.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Failed to add location';
        state.success = null;
      })

      // טיפול ב-updateLocation
      .addCase(updateLocation.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.success = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        const index = state.locations.findIndex(loc => loc.id === action.payload.id);
        if (index !== -1) {
          state.locations[index] = action.payload;
        }
        state.success = 'Location updated successfully';
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Failed to update location';
        state.success = null;
      })

      // טיפול ב-deleteLocation
      .addCase(deleteLocation.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.success = null;
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        // action.meta.arg.id מכיל את ה-ID שנשלח ל-thunk
        state.locations = state.locations.filter(loc => loc.id !== action.meta.arg.id);
        state.success = 'Location deleted successfully';
      })
      .addCase(deleteLocation.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Failed to delete location';
        state.success = null;
      })

      // טיפול ב-fetchLocations
      .addCase(fetchLocations.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.success = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        if (action.meta.arg.page === 1) {
          state.locations = action.payload.items;
        } else {
          const existingIds = new Set(state.locations.map(loc => loc.id));
          const newItems = action.payload.items.filter(loc => !existingIds.has(loc.id));
          state.locations = [...state.locations, ...newItems];
        }
        state.page = action.meta.arg.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Failed to fetch locations';
      })

      // טיפול ב-fetchLocationById
      .addCase(fetchLocationById.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.currentLocation = null;
      })
      .addCase(fetchLocationById.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.currentLocation = action.payload;
      })
      .addCase(fetchLocationById.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Failed to fetch location';
        state.currentLocation = null;
      });
  },
});

export const { resetLocations, clearStatus, clearLocationStatus } = locationSlice.actions;

// סלקטורים מממוזרים באמצעות createSelector
const selectLocationState = (state) => state.locations;

export const selectAllLocations = createSelector(
  [selectLocationState],
  (locationsState) => [...locationsState.locations]
);

export const selectLocationsStatus = createSelector(
  selectLocationState,
  (locationsState) => ({
    loading: locationsState.loading,
    success: locationsState.success,
    error: locationsState.error,
    page: locationsState.page,
    hasMore: locationsState.hasMore,
  })
);

export default locationSlice.reducer;
