// src/components/CustomTooltip.jsx
import React, { useState, useRef } from 'react';

const CustomTooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({});
  const triggerRef = useRef(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // נמקם את ה-tooltip מעל האלמנט המקורי או מצד ימין,
      // כדי שלא יוסתר ע"י המסגרת של הדפדפן.
      // נספק מיקום בסיסי ונוכל לשפר בהמשך עם בדיקת גבולות המסך.
      setPosition({
        top: rect.top + window.scrollY - 10, // 10px מעל האלמנט
        left: rect.left + window.scrollX + rect.width / 2, // במרכז האלמנט
        transform: 'translateX(-50%)', // ממורכז אופקית
      });

      // בדיקה בסיסית אם ה-tooltip יוצא מהמסך מצד ימין
      // אם הוא צפוי לצאת, נמקם אותו בצד שמאל במקום
      // (נדרש להתאים את הרוחב המשוער של ה-tooltip - כאן נניח כ-300px)
      const estimatedTooltipWidth = 300; // רוחב משוער של ה-tooltip
      if (rect.right + estimatedTooltipWidth > window.innerWidth) {
        setPosition({
          top: rect.top + window.scrollY - 10,
          left: rect.left + window.scrollX + rect.width, // ימין האלמנט
          transform: 'translateX(-100%)', // דחף אותו שמאלה כדי שלא יחרוג מהמסך
        });
      }
      // אם הוא קרוב לצד שמאל מדי
      if (rect.left - estimatedTooltipWidth < 0) {
         setPosition({
          top: rect.top + window.scrollY - 10,
          left: rect.left + window.scrollX, // שמאל האלמנט
          transform: 'translateX(0%)', // התחל מ-0 אחוז
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div className="relative inline-block" ref={triggerRef}
         onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children} {/* זהו האלמנט שמעליו נרחף (לדוגמה, תא הטבלה עם הסיבה) */}

      {isVisible && (
        <div
          className="absolute z-50 p-3 rounded-lg shadow-lg border border-golden-brown-light bg-white text-dark-gray-text text-sm max-w-sm break-words whitespace-pre-wrap"
          style={{ ...position, pointerEvents: 'none' }} // pointerEvents: 'none' מונע ממנו לחסום אינטראקציות עכבר
        >
          {content} {/* זהו התוכן שיוצג ב-tooltip */}
          {/* חץ קטן בתחתית או בצד */}
          <div className="absolute w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-golden-brown-light"
               style={{ bottom: '-8px', left: '50%', transform: 'translateX(-50%)' }}></div>
        </div>
      )}
    </div>
  );
};

export default CustomTooltip;