// src/components/UserProfileDisplay.jsx

import React, { useState, useEffect, useContext } from 'react'; // ✅ הוספת useContext
import { onAuthStateChanged } from 'firebase/auth'; // נשאיר את הייבוא אך נסיר את השימוש הישיר
import { auth } from '../firebase.js';
import { Link, useNavigate } from 'react-router-dom';
// import { fetchUserProfile } from '../services/userService'; // ✅ נסיר את הייבוא הזה, נשתמש ב-AuthContext
import defaultAvatar from '../assets/default_avatar.png';
import { AuthContext } from '../layouts/AuthLayout'; // ✅ ייבוא AuthContext

// Pencil Icon SVG (similar to how other icons are defined in Header.jsx)
const PencilIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
);

const UserProfileDisplay = () => {
  // ✅ קבל את currentUser ו-isAuthenticated מה-AuthContext
  const { currentUser, isAuthenticated, userId } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // אם המשתמש לא מאומת (לוגאאוט או לא מחובר), נווט לדף ההתחברות
    if (!isAuthenticated && !userId) { // וודא ש-userId גם לא קיים
      setLoading(false);
      navigate('/signin');
      return;
    }

    // אם currentUser כבר קיים (נטען ב-AuthLayout), השתמש בו ישירות
    if (currentUser) {
      setLoading(false);
      setError('');
    } else if (isAuthenticated && userId) {
      // אם isAuthenticated ו-userId קיימים אבל currentUser עדיין לא נטען (נדיר, אבל אפשרי בתזמונים)
      // זה אומר ש-AuthLayout עדיין בטעינה או שיש בעיה.
      // במקרה זה, נציג הודעת טעינה ונמתין ל-AuthLayout שיסיים.
      // בפועל, ה-AuthLayout כבר מונע רינדור של הילדים עד שהוא מסיים לטעון.
      setLoading(true); // נשאר במצב טעינה עד ש-currentUser יתעדכן
    } else {
      // אם לא מאומת ואין userId, סיום טעינה
      setLoading(false);
    }

    // אין צורך ב-onAuthStateChanged כאן, AuthLayout כבר מטפל בזה
    // וגם אין צורך ב-fetchUserProfile כאן, כי AuthLayout כבר טען את הנתונים
  }, [isAuthenticated, currentUser, userId, navigate]); // תלויות ב-isAuthenticated ו-currentUser

  if (loading) {
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-dark-gray-text">טוען פרופיל...</h2>
        <p className="text-gray-text mb-6">אנא המתן/המתני בזמן שאנו טוענים את פרטי הפרופיל שלך.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-red-500">שגיאה: {error}</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-golden-brown text-white font-bold py-2 px-4 rounded-none hover:bg-golden-brown-dark transition duration-200"
        >
          חזור לדף הבית
        </button>
      </div>
    );
  }

  // אם המשתמש לא מאומת או שאין נתוני פרופיל (לאחר סיום טעינה ושגיאות), אל תציג כלום או נווט
  if (!isAuthenticated || !currentUser) {
    return null; // או הפניה מחדש לדף התחברות, שכבר מטופלת ב-useEffect
  }

  return (
    <div className="w-full max-w-screen-lg mx-auto py-8 px-8">
      <div className="flex flex-col items-center w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-dark-gray-text w-full">
          הפרופיל שלי
        </h2>

        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
          {/* Profile Picture with Edit Icon Overlay */}
          <div className="relative w-36 h-36 mx-auto mb-6">
            <img
              // ✅ השתמש ב-currentUser.photoURL אם קיים, אחרת ב-defaultAvatar
              src={currentUser.photoURL || defaultAvatar}
              alt="Profile Picture"
              className="w-full h-full rounded-full object-cover border-4 border-golden-brown shadow-md"
            />
            <Link
              to="/edit-profile"
              className="absolute bottom-0 right-0 bg-golden-brown text-white rounded-full p-2 shadow-lg hover:bg-golden-brown-dark transition-colors duration-200"
              aria-label="Edit profile picture"
            >
              <PencilIcon />
            </Link>
          </div>

          <p className="text-gray-700 text-lg mb-4">
            <span className="font-semibold">שם מלא:</span> {currentUser.name || 'לא הוגדר'}
          </p>
          <p className="text-gray-700 text-lg mb-4">
            <span className="font-semibold">אימייל:</span> {currentUser.email || 'לא הוגדר'}
          </p>
          <p className="text-gray-700 text-lg mb-4">
            <span className="font-semibold">עיר:</span> {currentUser.city || 'לא הוגדר'}
          </p>
          {currentUser.phoneNumber && (
            <p className="text-gray-700 text-lg mb-6">
              <span className="font-semibold">מספר טלפון:</span> {currentUser.phoneNumber}
            </p>
          )}
          

          {/* Existing Edit Profile button - can keep or remove, but the icon now serves this purpose */}
          <Link
            to="/edit-profile"
            className="bg-golden-brown text-white font-bold py-3 px-6 rounded-none hover:bg-golden-brown-dark focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border transition duration-200"
            aria-label="Edit Profile"
          >
            ערוך/ערכי פרופיל
          </Link>

          <div className="mt-8">
            <Link
              to="/"
              className="text-link-blue hover:underline"
            >
              חזור/חזרי לדף הבית
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDisplay;
