// src/components/MyDraftsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../layouts/AuthLayout';
import { FaEdit, FaTrash, FaShareSquare, FaFileAlt, FaMapMarkedAlt } from 'react-icons/fa';

// ✅ ייבוא שירותי ה-API החדשים
import draftsApi from '../api/draftsApi'; // ייבוא שירות הטיוטות
// אין צורך לייבא postsApi ו-locationsApi כאן, הם מיובאים ב-draftsApi.js

// קומפוננטת מודאל התראה/אישור מותאמת אישית (נשארת כפי שהיא)
const CustomAlertDialog = ({ message, type, onConfirm, onCancel, showCancel = false }) => {
  if (!message) return null;

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
          {showCancel && (
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

const MyDraftsPage = () => {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertDialog, setAlertDialog] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);

  const fetchUserDrafts = async () => {
    if (!userId) {
      setLoading(false);
      setError('User not logged in.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // ✅ שימוש ב-draftsApi
      const fetchedDrafts = await draftsApi.fetchUserDrafts(userId);
      setDrafts(fetchedDrafts);
    } catch (err) {
      console.error('Failed to fetch user drafts:', err);
      setError('Failed to load drafts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDrafts();
  }, [userId]); // Fetch drafts when userId changes

  const handleDeleteDraft = async (draftId) => {
    try {
      // ✅ שימוש ב-draftsApi
      await draftsApi.deleteDraft(draftId);
      setAlertDialog({ type: 'success', message: 'הטיוטה נמחקה בהצלחה!' });
      fetchUserDrafts(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete draft:', err);
      setAlertDialog({ type: 'error', message: 'נכשל במחיקת הטיוטה. אנא נסה שוב.' });
    } finally {
      setShowDeleteConfirm(false);
      setDraftToDelete(null);
      setTimeout(() => setAlertDialog(null), 3000);
    }
  };

  const handlePublishDraft = async (draft) => {
    try {
      // ✅ שימוש ב-draftsApi.publishDraft
      await draftsApi.publishDraft(draft, userId); // הפונקציה כבר מטפלת במחיקת הטיוטה
      setAlertDialog({ type: 'success', message: `הטיוטה פורסמה בהצלחה כ-${draft.type === 'post' ? 'פוסט' : 'מיקום'}!` });
    } catch (err) {
      console.error('Failed to publish draft:', err);
      const errorMessage = err.message || err.response?.data?.error || `שגיאה בפרסום הטיוטה: ${err.message || ''}`;
      setAlertDialog({ type: 'error', message: errorMessage });
    } finally {
      setTimeout(() => setAlertDialog(null), 3000);
    }
  };

  const handleEditDraft = (draft) => {
    if (draft.type === 'post') {
      navigate(`/add-post/${draft.id}`);
    } else if (draft.type === 'location') {
      navigate(`/add-place/${draft.id}`);
    } else {
      setAlertDialog({ type: 'error', message: 'סוג טיוטה לא נתמך לעריכה.' });
      setTimeout(() => setAlertDialog(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-dark-gray-text">טוען טיוטות...</h2>
        <p className="text-gray-text mb-6">אנא המתן...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-red-600">שגיאה!</h2>
        <p className="text-gray-text mb-6">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 font-inter pt-16">
      <CustomAlertDialog
        message={alertDialog?.message}
        type={alertDialog?.type}
        onConfirm={() => setAlertDialog(null)}
        showCancel={false}
      />
      {showDeleteConfirm && (
        <CustomAlertDialog
          message="האם אתה בטוח שברצונך למחוק טיוטה זו?"
          type="warning"
          onConfirm={() => handleDeleteDraft(draftToDelete.id)}
          onCancel={() => setShowDeleteConfirm(false)}
          showCancel={true}
        />
      )}

      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">הטיוטות שלי</h2>

      {drafts.length === 0 ? (
        <p className="text-center py-6 text-gray-400">לא נמצאו טיוטות.</p>
      ) : (
        <ul className="space-y-4">
          {drafts.map((draft) => (
            <li key={draft.id} className="bg-white p-4 shadow-md rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex-1 mb-3 sm:mb-0">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  {draft.type === 'post' ? <FaFileAlt className="text-blue-500" /> : <FaMapMarkedAlt className="text-green-500" />}
                  <span>{draft.data.title || draft.data.name || 'טיוטה ללא כותרת'}</span>
                  <span className="text-sm text-gray-500 ml-2">({draft.type === 'post' ? 'פוסט' : 'מיקום'})</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  עודכן לאחרונה: {new Date(draft.updated_at || draft.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditDraft(draft)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1 text-sm"
                >
                  <FaEdit /> ערוך
                </button>
                <button
                  onClick={() => handlePublishDraft(draft)}
                  className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-1 text-sm"
                >
                  <FaShareSquare /> פרסם
                </button>
                <button
                  onClick={() => { setDraftToDelete(draft); setShowDeleteConfirm(true); }}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-1 text-sm"
                >
                  <FaTrash /> מחק
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyDraftsPage;
