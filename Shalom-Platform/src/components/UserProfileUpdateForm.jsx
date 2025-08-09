// src/components/UserProfileUpdateForm.jsx

import React, { useState, useEffect, useRef, useContext } from 'react';
import { onAuthStateChanged, updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebase.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import userService from '../api/userService'; // ✅ תיקון נתיב הייבוא
import defaultAvatar from '../assets/default_avatar.png';
import { AuthContext } from '../layouts/AuthLayout';

const UserProfileUpdateForm = () => {
  // ✅ קבל את userId ו-currentUser מה-AuthContext
  const { userId, currentUser, login } = useContext(AuthContext); // הוספתי login כדי שנוכל לעדכן את הקונטקסט לאחר שינויים

  const [firebaseUser, setFirebaseUser] = useState(null); // נשמור את אובייקט Firebase user כאן
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    city: '',
    phoneNumber: '', // ✅ הוספת שדה מספר טלפון
    newPassword: '',
    confirmNewPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);
  const fileInputRef = useRef(null);

  // Re-authentication state
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState('');
  const [pendingAction, setPendingAction] = useState(null); // 'email', 'password', 'delete'

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
        // טען את נתוני הפרופיל מה-backend אם הם קיימים ב-currentUser
        // אחרת, השתמש בנתוני Firebase הבסיסיים
        setProfileData({
          fullName: currentUser?.name || user.displayName || '',
          email: currentUser?.email || user.email || '',
          city: currentUser?.city || '',
          phoneNumber: currentUser?.phoneNumber || '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setAvatarPreview(currentUser?.profilePicture || user.photoURL || defaultAvatar);
      } else {
        setFirebaseUser(null);
        // אם אין משתמש, הפנה לדף התחברות
        navigate('/signin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, currentUser]); // הוספתי currentUser כתלות כדי שה-useEffect ירוץ מחדש כשהוא מתעדכן

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleReauthenticate = async (e) => {
    e.preventDefault();
    setReauthError('');
    setSubmitting(true);

    if (!reauthPassword) {
      setReauthError('אנא הזן/הזיני את סיסמתך הנוכחית.');
      setSubmitting(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, reauthPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      setShowReauthModal(false);
      setReauthPassword('');
      setError(''); // נקה שגיאות קודמות
      setSubmitting(false);

      // לאחר אימות מחדש, בצע את הפעולה הממתינה
      if (pendingAction === 'email') {
        await updateEmailAndProfile();
      } else if (pendingAction === 'password') {
        await updatePasswordAndProfile();
      }
      // ניתן להוסיף כאן לוגיקה עבור מחיקת משתמש אם נדרש
    } catch (err) {
      console.error("Reauthentication error:", err);
      let errorMessage = 'שגיאה באימות מחדש. אנא וודא/י שהסיסמה נכונה.';
      if (err.code === 'auth/wrong-password') {
        errorMessage = 'הסיסמה שהוזנה שגויה.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'משתמש לא נמצא.';
      }
      setReauthError(errorMessage);
      setSubmitting(false);
    }
  };


  const uploadAvatar = async (file, userId) => {
    if (!file) return null;
    const storageRef = ref(getStorage(), `avatars/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };


  const updateEmailAndProfile = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (profileData.email && profileData.email !== firebaseUser.email) {
        await updateEmail(firebaseUser, profileData.email);
        console.log("Firebase email updated successfully.");
      }
      // עדכן את הפרופיל ב-backend
      const updatedUser = await userService.updateUserProfile({
        userId: userId,
        userData: {
          name: profileData.fullName,
          email: profileData.email,
          city: profileData.city,
          phoneNumber: profileData.phoneNumber,
          profilePicture: avatarPreview, // שלח את ה-URL של התמונה המעודכנת
        },
      });
      // עדכן את ה-currentUser בקונטקסט
      login(null, userId, updatedUser.user); // נניח שה-backend מחזיר את המשתמש המעודכן תחת שדה 'user'
      setSuccess('הפרופיל עודכן בהצלחה!');
    } catch (err) {
      console.error("Error updating email/profile:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updatePasswordAndProfile = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (profileData.newPassword && profileData.newPassword === profileData.confirmNewPassword) {
        if (profileData.newPassword.length < 6) {
          setError('הסיסמה חייבת להיות באורך 6 תווים לפחות.');
          setSubmitting(false);
          return;
        }
        await updatePassword(firebaseUser, profileData.newPassword);
        console.log("Firebase password updated successfully.");
        setProfileData((prev) => ({ ...prev, newPassword: '', confirmNewPassword: '' })); // נקה שדות סיסמה
      } else if (profileData.newPassword && profileData.newPassword !== profileData.confirmNewPassword) {
        setError('הסיסמאות החדשות אינן תואמות.');
        setSubmitting(false);
        return;
      }
      // עדכן את הפרופיל ב-backend (אם יש שדות נוספים שצריך לעדכן)
      const updatedUser = await userService.updateUserProfile({
        userId: userId,
        userData: {
          name: profileData.fullName,
          email: profileData.email,
          city: profileData.city,
          phoneNumber: profileData.phoneNumber,
          profilePicture: avatarPreview,
        },
      });
      login(null, userId, updatedUser.user);
      setSuccess('הסיסמה והפרופיל עודכנו בהצלחה!');
    } catch (err) {
      console.error("Error updating password/profile:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!firebaseUser) {
      setError('אין משתמש מחובר.');
      setSubmitting(false);
      return;
    }

    try {
      let photoURL = avatarPreview;
      if (selectedFile) {
        photoURL = await uploadAvatar(selectedFile, userId);
        setAvatarPreview(photoURL); // עדכן את התצוגה המקדימה עם ה-URL החדש
      }

      // 1. עדכון Firebase Auth Profile (displayName, photoURL)
      if (profileData.fullName !== firebaseUser.displayName || photoURL !== firebaseUser.photoURL) {
        await updateProfile(firebaseUser, {
          displayName: profileData.fullName,
          photoURL: photoURL,
        });
        console.log("Firebase profile updated successfully.");
      }

      // 2. עדכון אימייל (דורש אימות מחדש אם האימייל משתנה)
      if (profileData.email && profileData.email !== firebaseUser.email) {
        setPendingAction('email');
        setShowReauthModal(true);
        setSubmitting(false);
        return; // עצור כאן, המשתמש יצטרך לאמת מחדש
      }

      // 3. עדכון סיסמה (דורש אימות מחדש אם הסיסמה משתנה)
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmNewPassword) {
          setError('הסיסמאות החדשות אינן תואמות.');
          setSubmitting(false);
          return;
        }
        setPendingAction('password');
        setShowReauthModal(true);
        setSubmitting(false);
        return; // עצור כאן, המשתמש יצטרך לאמת מחדש
      }

      // 4. עדכון פרטי משתמש ב-backend (שם, עיר, מספר טלפון, תמונת פרופיל)
      const updatedUser = await userService.updateUserProfile({
        userId: userId,
        userData: {
          name: profileData.fullName,
          email: profileData.email, // שלח את האימייל גם אם לא השתנה
          city: profileData.city,
          phoneNumber: profileData.phoneNumber,
          profilePicture: photoURL, // שלח את ה-URL של התמונה המעודכנת
        },
      });

      // עדכן את ה-currentUser בקונטקסט
      login(null, userId, updatedUser.user); // נניח שה-backend מחזיר את המשתמש המעודכן תחת שדה 'user'

      setSuccess('הפרופיל עודכן בהצלחה!');

    } catch (err) {
      console.error("Error updating profile:", err);
      let errorMessage = 'שגיאה בעדכון הפרופיל. נסה/י שוב.';
      if (err.code === 'auth/requires-recent-login') {
        errorMessage = 'יש להתחבר מחדש כדי לבצע פעולה זו.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'כתובת האימייל אינה תקינה.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'כתובת האימייל כבר בשימוש.';
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <svg className="animate-spin h-10 w-10 text-cyan-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">ערוך פרופיל</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {success && <p className="text-green-600 text-center mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={avatarPreview}
            alt="Avatar Preview"
            className="w-24 h-24 rounded-full object-cover border-4 border-golden-brown shadow-lg mb-4"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-none hover:bg-gray-300 transition duration-200"
          >
            החלף תמונת פרופיל
          </button>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">
            שם מלא:
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={profileData.fullName}
            onChange={handleInputChange}
            className="shadow-sm appearance-none border rounded-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border"
            placeholder="שם מלא"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            אימייל:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={profileData.email}
            onChange={handleInputChange}
            className="shadow-sm appearance-none border rounded-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border"
            placeholder="אימייל"
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">
            עיר:
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={profileData.city}
            onChange={handleInputChange}
            className="shadow-sm appearance-none border rounded-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border"
            placeholder="עיר"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
            מספר טלפון:
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={profileData.phoneNumber}
            onChange={handleInputChange}
            className="shadow-sm appearance-none border rounded-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border"
            placeholder="מספר טלפון (אופציונלי)"
          />
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">
            סיסמה חדשה (השאר/י ריק כדי לא לשנות):
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={profileData.newPassword}
            onChange={handleInputChange}
            className="shadow-sm appearance-none border rounded-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border"
            placeholder="סיסמה חדשה"
          />
        </div>

        {/* Confirm New Password */}
        <div>
          <label htmlFor="confirmNewPassword" className="block text-gray-700 text-sm font-bold mb-2">
            אשר/י סיסמה חדשה:
          </label>
          <input
            type="password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={profileData.confirmNewPassword}
            onChange={handleInputChange}
            className="shadow-sm appearance-none border rounded-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border"
            placeholder="אשר/י סיסמה חדשה"
          />
        </div>

        <button
          type="submit"
          className={`bg-golden-brown text-white font-bold py-2 px-4 rounded-none hover:bg-golden-brown-dark focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border transition duration-200 w-full ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={submitting}
        >
          {submitting ? 'שומר/ת שינויים...' : 'שמור/שמרי שינויים'}
        </button>
      </form>

      {/* Re-authentication Modal */}
      {showReauthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 shadow-lg border border-gray-200 w-96 text-center rounded-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">אימות מחדש נדרש</h3>
            <p className="mb-4 text-gray-700">
              אנא הזן/הזיני את סיסמתך הנוכחית כדי לאמת את זהותך ולהמשיך.
            </p>
            {reauthError && <p className="text-red-500 text-sm mb-3">{reauthError}</p>}
            <form onSubmit={handleReauthenticate}>
              <div className="mb-4">
                <label htmlFor="reauthPassword" className="sr-only">סיסמה נוכחית</label>
                <input
                  type="password"
                  id="reauthPassword"
                  name="reauthPassword"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  className="shadow-sm appearance-none border rounded-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border"
                  placeholder="סיסמה נוכחית"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReauthModal(false);
                    setReauthPassword('');
                    setReauthError('');
                    setPendingAction(null);
                    setSubmitting(false);
                    setError('הפעולה בוטלה. אנא נסה/י שוב.');
                  }}
                  className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-none hover:bg-gray-400 transition duration-200"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="bg-golden-brown text-white font-bold py-2 px-4 rounded-none hover:bg-golden-brown-dark transition duration-200"
                >
                  אשר/י
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileUpdateForm;
