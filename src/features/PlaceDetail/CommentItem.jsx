import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // לייבוא axios אם נדרש בתוך הקומפוננטה
import CustomAlertDialog from './CustomAlertDialog'; // ייבוא מודאל ההתראה
import { FaFlag } from 'react-icons/fa'; // ייבוא אייקון דיווח

// אייקון כוכב לדירוג (מועתק מ-PlaceDetail)
const StarIcon = ({ filled, onClick, className = '' }) => (
  <svg
    className={`w-6 h-6 ${filled ? 'text-yellow-400' : 'text-gray-300'} ${className} transform translate-z-0`}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}
  >
    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
  </svg>
);

// קומפוננטת אווטאר משתמש (מועתק מ-PlaceDetail)
const UserAvatar = ({ src, alt }) => {
  return (
    <div className="w-10 h-10 object-cover border border-gray-200 flex items-center justify-center bg-gray-100 overflow-hidden">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <img src={'https://placehold.co/40x40/cccccc/000000?text=User'} alt={alt} className="w-full h-full object-cover" />
      )}
    </div>
  );
};

// פונקציית עזר לעיצוב תאריך ושעה (מועתק מ-PlaceDetail)
const formatDateTime = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} | ${hours}:${minutes}`;
};


const CommentItem = ({ comment, onReplySubmitted, activeReplyId, onToggleReplyInput }) => {
  const [localReplyText, setLocalReplyText] = useState('');
  const [localReplyStatusMessage, setLocalReplyStatusMessage] = useState(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false); // State for showing more options dropdown
  const moreOptionsRef = useRef(null); // Ref for the more options button/dropdown
  const [alertDialog, setAlertDialog] = useState(null); // לניהול התראות בתוך הקומפוננטה

  const isThisCommentActiveForReply = activeReplyId === comment.id;

  // סגור תפריט אפשרויות נוספות בלחיצה מחוץ לו
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreOptionsRef.current && !moreOptionsRef.current.contains(event.target)) {
        setShowMoreOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // טיפול בשליחת תגובת משנה
  const handleLocalReplySubmit = async () => {
    if (!localReplyText.trim()) {
      setLocalReplyStatusMessage({ type: 'error', message: 'אנא הזן תגובה.' });
      setTimeout(() => setLocalReplyStatusMessage(null), 3000);
      return;
    }
    const result = await onReplySubmitted(comment.id, localReplyText);
    setLocalReplyStatusMessage(result);
    if (result.type === 'success') {
      setLocalReplyText('');
      onToggleReplyInput(null); // סגור את שדה התגובה לאחר שליחה מוצלחת
    }
    setTimeout(() => setLocalReplyStatusMessage(null), 3000);
  };

  // טיפול בדיווח על תגובה
  const handleReportComment = () => {
    // כאן תהיה הלוגיקה לשליחת הדיווח לשרת (לא ישירות למנהל, אלא לנקודת קצה של דיווחים)
    console.log(`Reporting comment ID: ${comment.id}`);
    // דוגמה לשליחת דיווח (יש להשלים את הלוגיקה המלאה ב-PlaceDetail או ב-backend)
    // axios.post('http://localhost:3001/api/reports', {
    //   item_type: 'comment', // סוג הפריט המדווח
    //   item_id: comment.id,
    //   user_id: 'current_user_id_here', // יש להחליף במזהה המשתמש האמיתי
    //   reason: 'Report reason here' // יש להוסיף טופס לבחירת סיבה
    // });
    setAlertDialog({ type: 'success', message: 'התגובה דווחה בהצלחה.' });
    setTimeout(() => setAlertDialog(null), 3000);
    setShowMoreOptions(false); // סגור את התפריט לאחר הדיווח
  };

  return (
    <div className={`pt-4 ${comment.parent_id ? 'ml-8' : ''}`}>
      {/* מודאל התראה עבור קומפוננטת CommentItem */}
      <CustomAlertDialog
        message={alertDialog?.message}
        type={alertDialog?.type}
        onConfirm={() => setAlertDialog(null)}
      />

      <div className="flex items-start justify-start mb-2">
        <UserAvatar src={comment.user?.avatar} alt={comment.user_name || 'Anonymous'} />
        <div className="text-left ml-3 flex flex-col flex-grow">
          <p className="font-semibold text-gray-800">{comment.user_name || 'Anonymous'}</p>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <p className="text-sm text-gray-500 leading-relaxed mr-2">
                {formatDateTime(new Date(comment.created_at))}
              </p>
              <button
                onClick={() => {
                  onToggleReplyInput(isThisCommentActiveForReply ? null : comment.id);
                }}
                className="text-golden-brown-dark hover:underline focus:outline-none mr-2"
                title="השב"
              >
                השב
              </button>
            </div>
            <div className="flex items-center">
              {comment.rating > 0 && ( // הצג דירוג רק אם קיים
                <div className="flex items-center space-x-0.5" dir="ltr">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} filled={i < comment.rating} />
                  ))}
                </div>
              )}
              <div className="relative inline-block text-left ml-2" ref={moreOptionsRef}>
                <button
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="text-gray-600 hover:text-golden-brown-dark focus:outline-none p-1 hover:bg-gray-100 transition-colors duration-200 inline-flex items-center"
                  title="אפשרויות נוספות"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                </button>
                {showMoreOptions && (
                  <div className="origin-top-left absolute left-0 mt-2 w-40 shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <button
                        onClick={handleReportComment}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center justify-start"
                        role="menuitem"
                      >
                        <FaFlag className="w-4 h-4 text-red-500 mr-2" />
                        <span>דווח</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* תוכן התגובה - מיושר עם בלוק הטקסט למעלה */}
      <p className="text-gray-700 text-left mb-3 leading-relaxed pl-[3.25rem]">
        {comment.content}
      </p>

      {/* סקשן קלט תגובה עבור תגובה זו */}
      {isThisCommentActiveForReply && (
        <div className="w-full mt-2 p-3 bg-gray-100">
          {localReplyStatusMessage && (
            <div className={`mb-4 p-3 text-center ${localReplyStatusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {localReplyStatusMessage.message}
            </div>
          )}
          <textarea
            className="w-full p-2 border focus:outline-none focus:ring-2 focus:ring-golden-brown-light text-left leading-relaxed mb-2"
            rows="3"
            placeholder="כתוב את תגובתך כאן..."
            value={localReplyText}
            onChange={(e) => setLocalReplyText(e.target.value)}
          ></textarea>
          <div className="flex justify-start mt-2 space-x-2">
            <button
              onClick={handleLocalReplySubmit}
              className="bg-golden-brown text-white px-4 py-2 hover:bg-golden-brown-dark"
            >
              שלח תגובה
            </button>
            <button
              onClick={() => { onToggleReplyInput(null); setLocalReplyText(''); setLocalReplyStatusMessage(null); }}
              className="bg-gray-200 text-gray-800 px-4 py-2 hover:bg-gray-300"
            >
              בטל
            </button>
          </div>
        </div>
      )}

      {/* הצג תגובות (מקושרות) - כעת מציג באופן רקורסיבי את CommentItem */}
      {(comment.replies || []).map(reply => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onReplySubmitted={onReplySubmitted} // העבר את הפונקציה הלאה
          activeReplyId={activeReplyId} // העבר את ה-ID הפעיל
          onToggleReplyInput={onToggleReplyInput} // העבר את ה-setter
        />
      ))}
    </div>
  );
};

export default CommentItem;
