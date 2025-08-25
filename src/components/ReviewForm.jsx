// src/components/ReviewForm.jsx
import React, { useState }from 'react';
import StarRating from './StarRating.jsx';

const ReviewForm = ({ onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please provide a rating (1-5 stars).');
      return;
    }
    if (comment.trim() === '') {
      setError('Please write a comment.');
      return;
    }
    if (reviewerName.trim() === '') {
      setError('Please enter your name.');
      return;
    }

    setError('');
    onSubmit({ rating, reviewerName, comment });
    
    setRating(0);
    setReviewerName('');
    setComment('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-xl font-bold text-dark-gray-text mb-4">Leave a Review</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="rating" className="block text-gray-text text-sm font-bold mb-2 text-center"> {/* הוספתי text-center לתווית */}
            Your Rating:
          </label>
          {/* קומפוננטת StarRating כבר ממורכזת פנימית */}
          <StarRating rating={rating} setRating={setRating} editable={true} size={40} /> {/* שיניתי את size ל-40 כאן */}
        </div>
        <div className="mb-4">
          <label htmlFor="reviewerName" className="block text-gray-text text-sm font-bold mb-2">
            Your Name:
          </label>
          <input
            type="text"
            id="reviewerName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-dark-gray-text leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="comment" className="block text-gray-text text-sm font-bold mb-2">
            Your Comment:
          </label>
          <textarea
            id="comment"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-dark-gray-text leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border h-24 resize-none"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review here..."
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-golden-brown text-white font-bold py-2 px-4 rounded-none hover:bg-golden-brown-dark focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border transition duration-200"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;