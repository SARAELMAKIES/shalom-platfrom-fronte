// src/components/CategoryForm.jsx
import React, { useState, useEffect } from 'react';

const CategoryForm = ({ currentCategory, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('location'); // ✅ ברירת מחדל: 'location'
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (currentCategory) {
      setName(currentCategory.name);
      setType(currentCategory.type || 'location'); // ✅ טען סוג קיים או ברירת מחדל
      setDescription(currentCategory.description || '');
    } else {
      setName('');
      setType('location'); // ✅ אפס לברירת מחדל בעת הוספה חדשה
      setDescription('');
    }
  }, [currentCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('שם הקטגוריה הוא שדה חובה.'); // ניתן להחליף ב-CustomAlertDialog
      return;
    }
    // ✅ העבר את ה-type יחד עם השם והתיאור
    onSave({ id: currentCategory ? currentCategory.id : null, name, type, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {currentCategory ? 'ערוך קטגוריה' : 'הוסף קטגוריה חדשה'}
      </h2>
      <div>
        <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
          שם קטגוריה:
        </label>
        <input
          type="text"
          id="category-name"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-golden-brown focus:border-golden-brown"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="category-type" className="block text-sm font-medium text-gray-700">
          סוג קטגוריה:
        </label>
        <select
          id="category-type"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-golden-brown focus:border-golden-brown"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
          <option value="location">מיקום</option>
          <option value="post">פוסט</option>
        </select>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          תיאור (אופציונלי):
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-golden-brown focus:border-golden-brown"
        ></textarea>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
        >
          ביטול
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-golden-brown text-white rounded-md hover:bg-golden-brown-dark"
        >
          שמור
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
