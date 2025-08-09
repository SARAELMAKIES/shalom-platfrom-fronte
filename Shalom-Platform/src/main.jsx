// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './app/store';
import App from './App';
import './index.css';
import { auth } from './firebase.js'; // ✅ הוסף/וודא ייבוא של אובייקט ה-auth

const root = createRoot(document.getElementById('root'));
// ✅ ודא ששורה זו ממוקמת לאחר ייבוא ה-auth
window.firebaseAuth = auth; // חשיפת אובייקט ה-auth לסקופ הגלובלי לצורך דיבוג

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
