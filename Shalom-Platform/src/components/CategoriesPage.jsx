import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; // ✅ ייבוא Redux hooks
import { 
  fetchCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory,
  selectAllCategories, 
  selectCategoriesLoading, 
  selectCategoriesError,
  clearCategoryStatus // ✅ ייבוא clearCategoryStatus
} from '../features/categories/categoriesSlice'; // ✅ ייבוא מ-categorySlice

import CategoryForm from './CategoryForm'; // וודא שקומפוננטה זו קיימת
import { AuthContext } from '../layouts/AuthLayout'; // ייבוא AuthContext
import CustomAlertDialog from '../features/PlaceDetail/CustomAlertDialog'; // ✅ נניח ש-CustomAlertDialog זמין

const CategoriesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // ✅ אתחול useDispatch
  const { loadingAuth, currentUser, userId } = useContext(AuthContext); // ✅ אחזור userId ו-currentUser

  const categories = useSelector(selectAllCategories); // ✅ אחזור קטגוריות מ-Redux
  const categoriesLoading = useSelector(selectCategoriesLoading); // ✅ אחזור מצב טעינה
  const categoriesError = useSelector(selectCategoriesError);   // ✅ אחזור שגיאות

  const [editingCategory, setEditingCategory] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [alertDialog, setAlertDialog] = useState(null); // ✅ סטייט ל-AlertDialog

  // טען קטגוריות כאשר הקומפוננטה נטענת או כאשר ה-dispatch משתנה
  useEffect(() => {
    dispatch(fetchCategories()); 
    // נקה סטטוסים בעת טעינת הדף כדי למנוע הודעות קודמות
    dispatch(clearCategoryStatus());
  }, [dispatch]);

  // לוגיקת הגנה על נתיבים
  useEffect(() => {
    if (loadingAuth || !currentUser || typeof currentUser.role === 'undefined') {
      return;
    }

    if (currentUser.role !== 'admin') {
      console.log("CategoriesPage: User not authorized. Redirecting to home.");
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000); 
      return () => clearTimeout(timer); 
    }
  }, [loadingAuth, currentUser, navigate]); 

  // טיפול בהוספת קטגוריה
  const handleAddCategory = async (newCategory) => {
    if (!userId) {
      setAlertDialog({ type: 'error', message: 'יש להתחבר כדי להוסיף קטגוריה.' });
      return;
    }
    setAlertDialog(null);
    try {
      await dispatch(addCategory({ ...newCategory, userId })).unwrap(); // ✅ שלח userId
      setAlertDialog({ type: 'success', message: 'קטגוריה נוספה בהצלחה!' });
      setIsFormOpen(false);
      setEditingCategory(null); // נקה מצב עריכה
    } catch (error) {
      setAlertDialog({ type: 'error', message: `שגיאה בהוספת קטגוריה: ${error}` });
    }
  };

  // טיפול בעדכון קטגוריה
  const handleUpdateCategory = async (updatedCategory) => {
    if (!userId) {
      setAlertDialog({ type: 'error', message: 'יש להתחבר כדי לעדכן קטגוריה.' });
      return;
    }
    setAlertDialog(null);
    try {
      await dispatch(updateCategory({ ...updatedCategory, userId })).unwrap(); // ✅ שלח userId
      setAlertDialog({ type: 'success', message: 'קטגוריה עודכנה בהצלחה!' });
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (error) {
      setAlertDialog({ type: 'error', message: `שגיאה בעדכון קטגוריה: ${error}` });
    }
  };

  // טיפול במחיקת קטגוריה
  const handleDeleteCategory = (id) => {
    if (!userId) {
      setAlertDialog({ type: 'error', message: 'יש להתחבר כדי למחוק קטגוריה.' });
      return;
    }
    setAlertDialog({
      type: 'confirm',
      message: 'האם אתה בטוח שברצונך למחוק קטגוריה זו?',
      onConfirm: async () => {
        setAlertDialog(null); // סגור את הקונפירמציה
        try {
          await dispatch(deleteCategory({ id, userId })).unwrap(); // ✅ שלח userId
          setAlertDialog({ type: 'success', message: 'קטגוריה נמחקה בהצלחה!' });
        } catch (error) {
          setAlertDialog({ type: 'error', message: `שגיאה במחיקת קטגוריה: ${error}` });
        }
      },
      onCancel: () => setAlertDialog(null),
      showCancel: true
    });
  };

  const startEditCategory = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingCategory(null);
    setIsFormOpen(false);
    dispatch(clearCategoryStatus()); // נקה סטטוסים כאשר הפורם נסגר
  };

  // הצגת מצבי טעינה/הרשאות
  if (loadingAuth || !currentUser || typeof currentUser.role === 'undefined') {
    return <p className="text-center mt-10 text-gray-500">טוען הרשאות...</p>;
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="text-center mt-10 text-red-600 text-lg font-semibold">
        אין לך הרשאה לצפות בדף זה. מנתב לדף הבית...
      </div>
    );
  }

  // הצגת מצבי טעינה/שגיאה עבור הקטגוריות עצמן
  if (categoriesLoading === 'pending') {
    return <p className="text-center mt-10 text-gray-500">טוען קטגוריות...</p>;
  }

  if (categoriesError) {
    return <p className="text-center mt-10 text-red-600">שגיאה בטעינת קטגוריות: {categoriesError}</p>;
  }

  return (
    <div className="container mx-auto p-4 pt-16">
      {alertDialog && (
        <CustomAlertDialog
          message={alertDialog.message}
          type={alertDialog.type}
          onConfirm={alertDialog.onConfirm || (() => setAlertDialog(null))}
          onCancel={alertDialog.onCancel}
          showCancel={alertDialog.showCancel}
        />
      )}

      <h1 className="text-3xl font-bold mb-6 text-golden-brown">ניהול קטגוריות</h1>

      <button
        onClick={() => { setIsFormOpen(true); setEditingCategory(null); }} // ✅ נקה editingCategory בהוספה
        className="bg-golden-brown text-white py-2 px-4 rounded-md hover:bg-golden-brown-dark mb-6 transition duration-200"
      >
        הוסף קטגוריה חדשה
      </button>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button
              onClick={closeForm}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              &times;
            </button>
            <CategoryForm
              currentCategory={editingCategory}
              onSave={editingCategory ? handleUpdateCategory : handleAddCategory}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="text-gray-600">אין קטגוריות להצגה.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  שם קטגוריה
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  סוג
                </th> {/* ✅ הוספת עמודת סוג */}
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{category.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{category.type}</p> {/* ✅ הצגת סוג */}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button
                      onClick={() => startEditCategory(category)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      ערוך
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      מחק
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
