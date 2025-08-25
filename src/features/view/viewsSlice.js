// features/views/viewsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const viewsSlice = createSlice({
  name: 'views',
  initialState: {
    posts: [],
    locations: [],
  },
  reducers: {
    addViewedPost: (state, action) => {
      const id = action.payload;
      // אם כבר קיים – הסר אותו, ואז הוסף לראש
      state.posts = [id, ...state.posts.filter(pid => pid !== id)].slice(0, 10); // רק 10 אחרונים
    },
    addViewedLocation: (state, action) => {
      const id = action.payload;
      state.locations = [id, ...state.locations.filter(lid => lid !== id)].slice(0, 10);
    },
  },
});

export const { addViewedPost, addViewedLocation } = viewsSlice.actions;
export default viewsSlice.reducer;