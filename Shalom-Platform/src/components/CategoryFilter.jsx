// src/components/CategoryFilter.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // ✅ ייבוא useSelector ו-useDispatch
import { 
  fetchCategories, 
  selectLocationCategories, // ✅ ייבוא סלקטור לקטגוריות מיקום
  selectCategoriesLoading,  // ✅ ייבוא סלקטור למצב טעינה
  selectCategoriesError     // ✅ ייבוא סלקטור לשגיאות
} from '../features/categories/categoriesSlice'; // ✅ ייבוא מ-categorySlice

const CategoryFilter = ({ selectedCategory, onCategoryChange, type = 'location' }) => { // ✅ הוספת prop 'type'
  const dispatch = useDispatch();
  const categories = useSelector(selectLocationCategories); // ✅ שימוש בסלקטור לקטגוריות מיקום
  const loading = useSelector(selectCategoriesLoading);    // ✅ אחזור מצב טעינה
  const error = useSelector(selectCategoriesError);      // ✅ אחזור שגיאות

  useEffect(() => {
    // ✅ טען קטגוריות כאשר הקומפוננטה נטענת או כאשר ה-type משתנה
    dispatch(fetchCategories(type)); 
  }, [dispatch, type]); // הוספת type כתלות כדי לטעון מחדש אם סוג הקטגוריה משתנה

  if (loading === 'pending') {
    return (
      <div className="w-full mb-4 text-center text-gray-600">
        טוען קטגוריות...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mb-4 text-center text-red-600">
        שגיאה בטעינת קטגוריות: {error}
      </div>
    );
  }

  return (
    <div className="w-full mb-4">
      <label
        htmlFor="category-select"
        className="block mb-1 text-gray-700 font-medium"
      >
        קטגוריה
      </label>
      <select
        id="category-select"
        value={selectedCategory}
        onChange={onCategoryChange}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">
          כל הקטגוריות
        </option>
        {/* ✅ מיפוי על הקטגוריות מה-Redux store */}
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name} {/* ✅ שימוש ב-category.name */}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
