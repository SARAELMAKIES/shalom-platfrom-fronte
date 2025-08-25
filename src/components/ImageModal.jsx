
import React, { useEffect } from 'react';

const ImageModal = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEscape = (event) => {
     
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]); // התלות ב-onClose מבטיחה שה-listener יעודכן אם הפונקציה משתנה (נדיר במקרה זה).
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose} 
      aria-modal="true" 
      role="dialog"    
      aria-label="Image viewer" 
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} // הוספת סגנון ישיר לטשטוש
    >
      <div
        className="relative max-w-4xl max-h-full overflow-auto bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-gray-800 bg-opacity-70 rounded-full p-2 text-xl hover:bg-opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close image viewer"
        >
          &times; 
        </button>

        <img
          src={imageUrl}
          alt="תצוגה מוגדלת" // טקסט אלטרנטיבי לתמונה המוגדלת.
          className="max-w-full max-h-screen object-contain rounded-lg" 
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600?text=Image+Load+Error"; }} 
        />
      </div>
    </div>
  );
};

export default ImageModal;
