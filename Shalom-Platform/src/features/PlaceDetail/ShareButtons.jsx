import React, { useState } from 'react';
import {
  FaFacebookF, FaTwitter, FaWhatsapp, FaLink
} from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import CustomAlertDialog from './CustomAlertDialog'; // ייבוא הקומפוננטה החדשה

// קומפוננטת כפתורי שיתוף
const ShareButtons = ({ itemUrl, title = "Check this out!" }) => {
  const [alertMessage, setAlertMessage] = useState(null); // סטייט להתראה מותאמת אישית
  const encodedUrl = encodeURIComponent(itemUrl);
  const encodedTitle = encodeURIComponent(title);

  // פונקציה לטיפול בהעתקת קישור ללוח הגזירים
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(itemUrl);
      setAlertMessage({ type: 'success', message: '🔗 הקישור הועתק!' });
    } catch (err) {
      setAlertMessage({ type: 'error', message: '❌ נכשל בהעתקה' });
    } finally {
      setTimeout(() => setAlertMessage(null), 3000); // נקה הודעה לאחר 3 שניות
    }
  };

  return (
    // ✅ שינוי: הוסר mt-3. הקומפוננטה המכילה תנהל את המרווחים.
    <div className="flex gap-4 items-center text-gray-600 text-sm">
      <span className="font-medium">שתף:</span>
      <button onClick={handleCopy} title="העתק קישור" className="hover:text-emerald-600">
        <FaLink size={18} />
      </button>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer" className="hover:text-blue-600">
        <FaFacebookF size={18} />
      </a>
      <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noreferrer" className="hover:text-blue-400">
        <FaTwitter size={18} />
      </a>
      <a href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noreferrer" className="hover:text-green-600">
        <FaWhatsapp size={18} />
      </a>
      <a href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`} className="hover:text-rose-600">
        <FiMail size={18} />
      </a>
      {/* הצגת מודאל ההתראה המותאם אישית */}
      <CustomAlertDialog
        message={alertMessage?.message}
        type={alertMessage?.type}
        onConfirm={() => setAlertMessage(null)}
      />
    </div>
  );
};

export default ShareButtons;
