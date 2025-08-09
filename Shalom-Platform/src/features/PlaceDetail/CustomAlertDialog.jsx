import React from 'react';

// קומפוננטת מודאל התראה/אישור מותאמת אישית - מחליפה את alert() ו-confirm()
const CustomAlertDialog = ({ message, type, onConfirm, onCancel, showCancel = false }) => {
  if (!message) return null; // אם אין הודעה, אל תציג את המודאל

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 shadow-lg border border-gray-200 w-80 text-center rounded-md">
        <p className={`text-lg font-semibold mb-4 ${type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md ${type === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            OK
          </button>
          {showCancel && ( // הצג כפתור ביטול רק אם showCancel הוא true
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 hover:bg-gray-400 rounded-md"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomAlertDialog;
