import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // נשתמש ב-axios לשליחת פרטי משתמש לשרת
import { initializeApp } from 'firebase/app'; // ייבוא לאתחול Firebase
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'; // ייבוא פונקציות Auth

// יצירת הקונטקסט
export const UserContext = createContext(null);

// **הגדרות Firebase שלך - הוטמעו כאן מהקוד שסיפקת**
const firebaseConfig = {
  apiKey: "AIzaSyBg-h2SQj_CqqiKpQlRSrxIeUNQGF6MzuI",
  authDomain: "shalom-ffa67.firebaseapp.com",
  projectId: "shalom-ffa67",
  storageBucket: "shalom-ffa67.firebasestorage.app",
  messagingSenderId: "520151164303",
  appId: "1:520151164303:web:3f0c8e64525f398b43d7fa",
  measurementId: "G-24XNTSKKQ6"
};

// אתחול Firebase (רק פעם אחת)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // קבלת מופע של Auth

// קומפוננטת ה-Provider שתעטוף את האפליקציה
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // סטייט לניהול מצב טעינת המשתמש

  // אפקט המאזין לשינויים במצב האימות של Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // משתמש מחובר ב-Firebase
        // נסה לאחזר פרטים נוספים מה-backend שלך (כמו תפקיד)
        let userRole = 'user'; // ברירת מחדל
        let userName = user.displayName || user.email; // שם מ-Firebase או אימייל

        try {
          // נסה לשלוח את פרטי המשתמש לשרת שלך כדי ליצור/לעדכן אותו שם
          // זה חשוב כדי שהשרת יכיר את המשתמשים מ-Firebase
          const response = await axios.post('http://localhost:3001/api/users', {
            id: user.uid,
            name: userName,
            email: user.email,
            role: userRole // שלח תפקיד ברירת מחדל או תפקיד שאוחזר
          });
          // אם השרת החזיר תפקיד ספציפי, השתמש בו
          if (response.data.user && response.data.user.role) {
            userRole = response.data.user.role;
          }
          if (response.data.user && response.data.user.name) {
            userName = response.data.user.name; // השתמש בשם מהשרת אם קיים
          }
          console.log('User data sent/updated on backend:', response.data.user);
        } catch (error) {
          console.error('Failed to send user data to backend:', error);
        }

        setCurrentUser({
          id: user.uid,
          name: userName,
          email: user.email,
          role: userRole // השתמש בתפקיד שאוחזר/נקבע
        });
      } else {
        // משתמש התנתק
        setCurrentUser(null);
      }
      setLoadingUser(false); // סיים לטעון את מצב המשתמש
    });

    // פונקציית ניקוי: בטל את ההאזנה כאשר הקומפוננטה נעלמת
    return () => unsubscribe();
  }, []); // ריצה פעם אחת בלבד בעת טעינת הקומפוננטה

  // פונקציית התחברות שתשתמש ב-Firebase Auth
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged יטפל בעדכון ה-currentUser
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Firebase login error:", error);
      return { success: false, error: error.message };
    }
  };

  // פונקציית התנתקות שתשתמש ב-Firebase Auth
  const logout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged יטפל בעדכון ה-currentUser
      return { success: true };
    } catch (error) {
      console.error("Firebase logout error:", error);
      return { success: false, error: error.message };
    }
  };

  // אם המשתמש עדיין בטעינה, ניתן להציג מסך טעינה
  if (loadingUser) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
        <p className="text-lg text-gray-700">טוען משתמש...</p>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
