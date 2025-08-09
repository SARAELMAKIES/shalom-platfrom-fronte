// src/components/ReviewsSection.jsx
import React, { useState, useEffect } from 'react';
import ReviewForm from './ReviewForm.jsx';
import ReviewItem from './ReviewItem.jsx';

const ReviewsSection = ({ placeId }) => {
  // נתוני Mock לתגובות - נחזיק אותם כאן כרגע
  // בעתיד, נתונים אלו יגיעו מ-API
  const [reviews, setReviews] = useState([]);

  // Mock data for reviews, tied to placeId
  useEffect(() => {
    // ב-Backend אמיתי, היינו מבצעים קריאת API לכאן
    // כרגע, נשתמש בנתוני Mock פשוטים עבור כמה מקומות
    // const mockReviewsData = {
    //   '1': [ // For 'Italian Pizza'
    //     { rating: 5, reviewerName: 'Sara L.', comment: 'Amazing pizza, highly recommend!' },
    //     { rating: 4, reviewerName: 'David K.', comment: 'Great taste, but service was a bit slow.' },
    //   ],
    //   '3': [ // For 'Yossi's Meat Restaurant'
    //     { rating: 5, reviewerName: 'Chaim M.', comment: 'Best grilled meats in town, fresh and delicious.' },
    //     { rating: 4, reviewerName: 'Rivka S.', comment: 'Very good food, nice atmosphere, a bit pricey.' },
    //   ],
    //   // הוסף נתוני Mock נוספים למקומות אחרים לפי הצורך
    // };

    setReviews(mockReviewsData[placeId] || []); // טען תגובות עבור המקום הספציפי, או מערך ריק
  }, [placeId]); // תלוי ב-placeId כדי לטעון תגובות שונות למקומות שונים

  const handleAddReview = (newReview) => {
    // בעתיד: שליחת ה-newReview ל-API, ואז עדכון ה-state לאחר תגובה מוצלחת מהשרת
    // כרגע, נוסיף ל-Mock data באופן זמני
    setReviews((prevReviews) => [...prevReviews, newReview]);
    alert('Thank you for your review!'); // הודעת אישור זמנית
  };

  // חישוב דירוג ממוצע
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  return (
    <div className="mt-16 bg-gray-50 p-6 rounded-lg shadow-inner"> {/* מרווח גדול מלמעלה */}
      <h2 className="text-3xl font-bold text-dark-gray-text mb-8 text-center">
        User Reviews
        {reviews.length > 0 && (
          <span className="block text-lg text-golden-brown font-normal mt-2">
            Average Rating: {averageRating} / 5
          </span>
        )}
      </h2>

      {/* טופס הוספת תגובה */}
      <ReviewForm onSubmit={handleAddReview} />

      {/* רשימת תגובות קיימות */}
      <div className="mt-8"> {/* מרווח בין הטופס לרשימה */}
        {reviews.length === 0 ? (
          <p className="text-gray-text text-center">No reviews yet. Be the first to leave one!</p>
        ) : (
          <div className="space-y-4"> {/* מרווח בין כל פריט תגובה */}
            {reviews.map((review, index) => (
              <ReviewItem key={index} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;