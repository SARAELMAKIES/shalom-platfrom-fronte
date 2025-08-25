import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/reviews';

/**
 * מוחק ביקורת ספציפית מהשרת.
 * @param {string} reviewId - ה-ID של הביקורת למחיקה.
 * @returns {Promise<string>} - ה-ID של הביקורת שנמחקה.
 */
export const deleteReview = async (reviewId) => {
  await axios.delete(`${BASE_URL}/${reviewId}`);
  return reviewId;
};

const reviewsApi = {
  deleteReview,
};

export default reviewsApi;
