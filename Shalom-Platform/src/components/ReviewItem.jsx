// src/components/ReviewItem.jsx
import React from 'react';
import StarRating from './StarRating.jsx';

const ReviewItem = ({ review }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-2 justify-start"> {/* שיניתי ל-justify-start אם אתה רוצה שהכוכבים יהיו צמודים לשמאל בתוך ה-ReviewItem */}
        {/* הצגת דירוג הכוכבים - לא ניתן לעריכה */}
        {/* גודל הכוכבים כאן יהיה 24px (ברירת המחדל שהגדרנו ב-StarRating.jsx) */}
        <StarRating rating={review.rating} editable={false} size={24} /> {/* השארתי size=24, אפשר לשנות */}
        <span className="ml-3 text-sm text-gray-text">
          {review.rating} out of 5 stars
        </span>
      </div>
      <p className="text-dark-gray-text text-base mb-2">{review.comment}</p>
      <p className="text-gray-500 text-sm font-semibold">
        — {review.reviewerName}
      </p>
    </div>
  );
};

export default ReviewItem;