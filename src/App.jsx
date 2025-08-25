// src/App.jsx
import React from 'react'; 
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './UserContext'; 

// ייבוא קומפוננטות הדפים
import HomePage from './components/HomePage.jsx';
import SignInForm from './components/SignInForm.jsx';
import SignUpForm from './components/SignUpForm.jsx';
import UserProfileDisplay from './components/UserProfileDisplay.jsx';
import UserProfileUpdateForm from './components/UserProfileUpdateForm.jsx';
import PlaceDetail from './components/PlaceDetail.jsx';
import CategoriesPage from './components/CategoriesPage.jsx';
import MyLocationsPage from './components/MyLocationsPage.jsx';
import MyPostsPage from './components/MyPostsPage.jsx';
import FavoritesPage from './components/FavoritesPage.jsx';
import AddLocationPage from './components/AddLocationPage';
import AddPostPage from './components/AddPostPage.jsx';
import ShabbatTimesPage from './components/ShabbatTimesPage';
import HelpPage from './components/HelpPage.jsx';
import AdminReportsPage from './components/AdminReportsPage.jsx';
import PostList from './features/posts/PostList.jsx';
import PostDetail from './features/posts/PostDetail.jsx';
import LocationList from './features/locations/LocationList.jsx';
import PageNotFound from './Pages/PageNotFound.jsx';
import UserHistory from "./features/users/UserHistory.jsx";
import AdminDashboard from './features/users/AdminDashboard.jsx';
import MyDraftsPage from './components/MyDraftsPage.jsx';

// ייבוא קומפוננטת דף הפרופיל המפורט החדשה
import UserProfilePage from './components/UserProfilePage';
// ✅ ייבוא קומפוננטת ניהול המשתמשים החדשה
import AdminUsers from './features/users/AdminUsers.jsx'; // וודא שנתיב זה נכון

// ייבוא AuthLayout עצמו
import AuthLayout from './layouts/AuthLayout'; 
// import Navigation from './components/Navigation.jsx';

// אין צורך לייבא Header ו-Footer כאן, מכיוון שהם נטענים בתוך AuthLayout

function App() {
  return (
    // ✅ הסרת <Router> מכאן. הוא אמור להיות בקובץ הכניסה הראשי (לדוגמה, main.jsx).
    <UserProvider>
  

      {/* ✅ AuthLayout עוטף כעת את כל ה-Routes.
           הוא יהיה הקומפוננטה הראשית שמספקת את AuthContext
           ומטפלת בטעינה ראשונית ובהגנה על נתיבים.
           ה-Header וה-Footer ירונדרו בתוך AuthLayout. */}
      <Routes>
        
        <Route element={<AuthLayout />}> 
          {/* כל הנתיבים הבאים הם ילדים של AuthLayout ויוצגו בתוך <Outlet /> ב-AuthLayout */}
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          
          <Route path="/profile" element={<UserProfileDisplay />} />
          <Route path="/user-profile-view/:userId" element={<UserProfilePage />} />
          
          <Route path="/edit-profile" element={<UserProfileUpdateForm />} />
          <Route path="/place/:id" element={<PlaceDetail />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/categories" element={<CategoriesPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          {/* ✅ הוספת מסלול חדש לניהול משתמשים */}
          <Route path="/admin/users" element={<AdminUsers />} /> 
          <Route path="/my-locations" element={<MyLocationsPage />} />
          <Route path="/my-posts" element={<MyPostsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/community-posts" element={<PostList />} />
          <Route path="/community-places" element={<LocationList />} />
          
          <Route path="/user-posts/:creatorId" element={<PostList />} />
          <Route path="/user-locations/:creatorId" element={<LocationList />} />

          <Route path="/add-place/:draftId?" element={<AddLocationPage />} />
          <Route path="/add-post/:draftId?" element={<AddPostPage />} />
          <Route path="/shabbat-times" element={<ShabbatTimesPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/my-activity" element={<UserHistory />} />
          <Route path="/my-drafts" element={<MyDraftsPage />} />

          {/* ניתובים הדורשים הרשאות אדמין - ההגנה מתבצעת בתוך AuthLayout או בקומפוננטה עצמה */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          <Route path="*" element={<PageNotFound />} />
        </Route> 
      </Routes>
    </UserProvider>
  );
}

export default App;
