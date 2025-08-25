import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  FaThumbsUp, FaRegThumbsUp, // Like icons
  FaHeart, FaRegHeart,       // Favorite icons
  FaFlag, FaEye
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserLikedItems } from '../features/likes/likesSlice';
import { toggleFavorite, selectFavorites } from '../features/posts/favoritesSlice';

// ייבוא אייקונים מ-lucide-react
import {
  Frown, MegaphoneOff, AlertTriangle, Ban, MapPinOff, Copy, Lock, ImageOff, DollarSign, Edit,
} from 'lucide-react';

// ייבוא הקונטקסט של המשתמש
import { UserContext } from '../UserContext';

// ייבוא הקומפוננטות המפוצלות
import CustomAlertDialog from '../features/PlaceDetail/CustomAlertDialog';
import ShareButtons from '../features/PlaceDetail/ShareButtons';
import CommentItem from '../features/PlaceDetail/CommentItem';
import PlaceImageGallery from '../features/PlaceDetail/PlaceImageGallery';

// ✅ ייבוא שירותי ה-API
import locationsApi from '../api/locationsApi';
import commentsApi from '../api/commentsApi';
import likesApi from '../api/likesApi';
import reportsApi from '../api/reportsApi';


// Star icon for rating
const StarIcon = ({ filled, onClick, className = '' }) => (
  <svg
    className={`w-6 h-6 ${filled ? 'text-yellow-400' : 'text-gray-300'} ${className} transform translate-z-0`}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
  </svg>
);

// Helper function to parse dates for sorting
const parseDateString = (dateStr) => {
  if (typeof dateStr !== 'string' || !dateStr.includes(' | ')) {
    try {
      const isoDate = new Date(dateStr);
      if (!isNaN(isoDate.getTime())) {
        return isoDate;
      }
    } catch (e) {
      console.warn("Invalid date string provided to parseDateString, falling back to epoch:", dateStr);
      return new Date(0);
    }
    console.warn("Invalid date string provided to parseDateString, falling back to epoch:", dateStr);
    return new Date(0);
  }
  const [datePart, timePart] = dateStr.split(' | ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
};

// Sorting function for comments/replies (newest first)
const sortByDateDesc = (a, b) => {
  const dateA = parseDateString(a.date || a.created_at);
  const dateB = parseDateString(b.date || b.created_at);
  return dateB.getTime() - dateA.getTime();
};

// Helper function to build a hierarchical comment tree from a flat list
const buildCommentTree = (flatComments) => {
  const commentsById = {};
  const rootComments = [];

  flatComments.forEach(comment => {
    commentsById[comment.id] = { ...comment, replies: [] };
  });

  flatComments.forEach(comment => {
    if (comment.parent_id && commentsById[comment.parent_id]) {
      commentsById[comment.parent_id].replies.push(commentsById[comment.id]);
    } else if (!comment.parent_id && comment.item_type === 'location') {
      rootComments.push(commentsById[comment.id]);
    }
  });

  Object.values(commentsById).forEach(comment => {
    comment.replies.sort(sortByDateDesc);
  });

  return rootComments.sort(sortByDateDesc);
};

// ✅ Define report reasons with icons (as in ItemCard.jsx)
const reportReasonsOptions = [
  { value: '', label: 'בחר סיבת דיווח', icon: null },
  { value: 'offensive_content', label: 'תוכן פוגעני או מעליב', icon: Frown },
  { value: 'hate_speech', label: 'דברי שנאה או הסתה', icon: MegaphoneOff },
  { value: 'misleading_info', label: 'מידע שגוי או מטעה', icon: AlertTriangle },
  { value: 'inappropriate_content', label: 'תוכן לא ראוי/בלתי הולם', icon: Ban },
  { value: 'incorrect_location', label: 'מיקום שגוי או לא קיים', icon: MapPinOff },
  { value: 'duplicate_spam', label: 'תוכן כפול או ספאם', icon: Copy },
  { value: 'privacy_violation', label: 'פגיעה בפרטיות או מידע רגיש', icon: Lock },
  { value: 'irrelevant_fake_images', label: 'תמונות לא רלוונטיות / מזויפות', icon: ImageOff },
  { value: 'unauthorized_commercial', label: 'פרסום מסחרי לא מורשה', icon: DollarSign },
  { value: 'other', label: 'אחר (פרט)', icon: Edit },
];


const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const currentUserId = currentUser?.id;
  const userRole = currentUser?.role;

  const [placeDetails, setPlaceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewName, setNewReviewName] = useState(currentUser?.name || '');
  const [newReviewEmail, setNewReviewEmail] = useState(currentUser?.email || '');
  const [newReviewStatusMessage, setNewReviewStatusMessage] = useState(null);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [reviewTextError, setReviewTextError] = useState('');
  const [ratingError, setRatingError] = useState('');

  const dispatch = useDispatch();
  const likedItems = useSelector(selectUserLikedItems);
  const liked = likedItems[id];
  const favorites = useSelector(selectFavorites);
  const isFavorite = !!favorites[id];

  const [publicLikes, setPublicLikes] = useState(0);
  const [currentViews, setCurrentViews] = useState(0);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState(''); // ✅ Selected report reason from the list
  const [customReportReason, setCustomReportReason] = useState(''); // ✅ Free text report reason
  const [showCustomReportReasonInput, setShowCustomReportReasonInput] = useState(false); // ✅ Control free text field visibility
  const [reportReasonError, setReportReasonError] = useState(''); // ✅ Report validation error
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alertDialog, setAlertDialog] = useState(null);

  const isAdmin = userRole === 'admin';

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState('0.0');
  const [showReplyInputId, setShowReplyInputId] = useState(null);

  useEffect(() => {
    setNewReviewName(currentUser?.name || '');
    setNewReviewEmail(currentUser?.email || '');
  }, [currentUser]);

  const getImageSrc = (imageName) => {
    if (!imageName) return '';
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    return `http://localhost:3001/uploads/${imageName}`;
  };

  const fetchComments = useCallback(async () => {
    try {
      // ✅ Use commentsApi
      const fetchedComments = await commentsApi.fetchCommentsByItem({ item_id: id, item_type: 'location' });

      const topLevelReviews = fetchedComments.filter(c => !c.parent_id && c.item_type === 'location' && c.rating !== undefined);
      const totalRating = topLevelReviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = topLevelReviews.length > 0 ? (totalRating / topLevelReviews.length).toFixed(1) : '0.0';
      setAverageRating(avgRating);
      setReviews(buildCommentTree(fetchedComments));
    } catch (err) {
      console.error("Failed to fetch comments for average rating:", err);
    }
  }, [id]);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // ✅ Use locationsApi
        const response = await locationsApi.fetchLocationById(id);
        setPlaceDetails(response);
        fetchComments();

        // ✅ Use likesApi
        const likesRes = await likesApi.fetchPublicLikesCounts({ itemIds: [id], itemType: 'location' });
        setPublicLikes(likesRes[id] || 0); // likesApi.fetchPublicLikesCounts returns a map

        const viewedKey = `viewed-location-${id}`;
        if (!sessionStorage.getItem(viewedKey)) {
          // ✅ Use locationsApi
          const viewsRes = await locationsApi.incrementLocationViews(id);
          if (viewsRes.views !== undefined) {
            setCurrentViews(viewsRes.views);
            sessionStorage.setItem(viewedKey, 'true');
          }
        } else {
            // ✅ Use locationsApi
            const viewsRes = await locationsApi.fetchLocationById(id); // Re-fetch to get the updated count
            if (viewsRes.views !== undefined) {
              setCurrentViews(viewsRes.views);
            }
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('המיקום לא נמצא.');
        } else {
          setError('שגיאה בטעינת פרטי המיקום. אנא נסה שוב מאוחר יותר.');
          console.error("Failed to fetch place details:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [id, fetchComments]);

  useEffect(() => {
    const savedCommentData = sessionStorage.getItem('savedCommentData');
    if (savedCommentData) {
      try {
        const parsedData = JSON.parse(savedCommentData);
        setNewReviewText(parsedData.text || '');
        setNewReviewRating(parsedData.rating || 0);
        setNewReviewName(parsedData.name || '');
        setNewReviewEmail(parsedData.email || '');
        sessionStorage.removeItem('savedCommentData');
      } catch (e) {
        console.error("Failed to parse saved comment data from sessionStorage:", e);
        sessionStorage.removeItem('savedCommentData');
      }
    }
  }, []);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const handlePublicLike = async () => {
    if (!currentUser) {
      setAlertDialog({ type: 'error', message: 'יש להתחבר כדי לבצע לייק.' });
      return;
    }
    try {
      // ✅ Use likesApi
      await likesApi.toggleVote({
        userId: currentUserId,
        itemType: 'location',
        itemId: id,
        isLiked: liked // Pass current liked status
      });
      // After like, fetch the updated public count
      const res = await likesApi.fetchPublicLikesCounts({ itemIds: [id], itemType: 'location' });
      setPublicLikes(res[id] || 0);
    } catch (err) {
      console.error('שגיאה בשליחת לייק ציבורי:', err);
      setAlertDialog({ type: 'error', message: 'שגיאה בשליחת לייק. אנא נסה שוב.' });
    } finally {
      setTimeout(() => setAlertDialog(null), 3000);
    }
  };

  const handleToggleFavorite = () => {
    if (!currentUser) {
      setAlertDialog({ type: 'error', message: 'יש להתחבר כדי להוסיף למועדפים.' });
      setTimeout(() => setAlertDialog(null), 3000);
      return;
    }
    dispatch(toggleFavorite(id));
    setAlertDialog({ type: 'success', message: `פריט ${isFavorite ? 'הוסר מ' : 'נוסף ל'}מועדפים!` });
    setTimeout(() => setAlertDialog(null), 3000);
  };

  // ✅ Updated handleReportSubmit function for the main place
  const handleReportSubmit = async () => {
    setReportReasonError(''); // Reset previous errors

    if (!currentUser) {
      setAlertDialog({ type: 'error', message: 'יש להתחבר כדי לדווח.' });
      return;
    }

    let finalReason = reportReason;
    if (reportReason === 'other') {
      if (!customReportReason.trim()) {
        setReportReasonError('אנא פרט את סיבת הדיווח.');
        return;
      }
      finalReason = `אחר: ${customReportReason.trim()}`;
    } else if (!reportReason) {
      setReportReasonError('אנא בחר סיבת דיווח.');
      return;
    }

    try {
      // ✅ Use reportsApi
      const res = await reportsApi.submitReport({
        item_type: 'location',
        item_id: id,
        user_id: currentUserId,
        reason: finalReason
      });

      if (res) { // reportsApi.submitReport returns the data directly
        setAlertDialog({ type: 'success', message: 'הדיווח נשלח בהצלחה!' });
        setShowReportForm(false);
        setReportReason(''); // Reset selection
        setCustomReportReason(''); // Reset free text
        setShowCustomReportReasonInput(false); // Hide free text field
      } else {
        setAlertDialog({ type: 'error', message: 'נכשל בשליחת דיווח.' });
      }
    } catch (err) {
      console.error('שגיאה בשליחת דיווח:', err);
      setAlertDialog({ type: 'error', message: 'שגיאה בשליחת דיווח. אנא נסה שוב.' });
    } finally {
      setTimeout(() => setAlertDialog(null), 3000);
    }
  };

  // ✅ New function to handle comment reporting
  const handleCommentReport = async (commentId, reason, customReason) => {
    if (!currentUser) {
      setAlertDialog({ type: 'error', message: 'יש להתחבר כדי לדווח על תגובות.' });
      return { success: false, message: 'יש להתחבר כדי לדווח על תגובות.' };
    }

    let finalReason = reason;
    if (reason === 'other') {
      if (!customReason.trim()) {
        setAlertDialog({ type: 'error', message: 'אנא פרט את סיבת הדיווח על התגובה.' });
        return { success: false, message: 'אנא פרט את סיבת הדיווח על התגובה.' };
      }
      finalReason = `אחר: ${customReason.trim()}`;
    } else if (!reason) {
      setAlertDialog({ type: 'error', message: 'אנא בחר סיבת דיווח על התגובה.' });
      return { success: false, message: 'אנא בחר סיבת דיווח על התגובה.' };
    }

    try {
      // ✅ Use reportsApi
      const res = await reportsApi.submitReport({
        item_type: 'comment', // Item type is 'comment'
        item_id: commentId,
        user_id: currentUserId,
        reason: finalReason
      });

      if (res) { // reportsApi.submitReport returns the data directly
        setAlertDialog({ type: 'success', message: 'הדיווח על התגובה נשלח בהצלחה!' });
        return { success: true, message: 'הדיווח על התגובה נשלח בהצלחה!' };
      } else {
        setAlertDialog({ type: 'error', message: 'נכשל בשליחת דיווח על התגובה.' });
        return { success: false, message: 'נכשל בשליחת דיווח על התגובה.' };
      }
    } catch (err) {
      console.error('שגיאה בשליחת דיווח על תגובה:', err);
      setAlertDialog({ type: 'error', message: 'שגיאה בשליחת דיווח על תגובה. אנא נסה שוב.' });
      return { success: false, message: 'שגיאה בשליחת דיווח על תגובה. אנא נסה שוב.' };
    } finally {
      setTimeout(() => setAlertDialog(null), 3000);
    }
  };


  const handleDelete = async () => {
    if (!currentUser) {
      setAlertDialog({ type: 'error', message: 'יש להתחבר כדי למחוק פריטים.' });
      return;
    }
    try {
      // ✅ Use locationsApi
      await locationsApi.deleteLocation({ id, userId: currentUserId, role: userRole });
      setAlertDialog({ type: 'success', message: 'הפריט נמחק בהצלחה!' });
      setShowDeleteModal(false);
      navigate('/');
    } catch (err) {
      console.error('שגיאה במחיקת הפריט:', err);
      const errorMessage = err.response?.data?.error || 'שגיאה במחיקת הפריט. אנא נסה שוב.';
      setAlertDialog({ type: 'error', message: errorMessage });
    } finally {
      setTimeout(() => setAlertDialog(null), 3000);
    }
  };

  const handleNewReviewSubmit = async () => {
    setNameError('');
    setEmailError('');
    setReviewTextError('');
    setRatingError('');
    setNewReviewStatusMessage(null);

    let isValid = true;

    if (!newReviewName.trim()) {
      setNameError('שם חובה.');
      isValid = false;
    }
    if (!newReviewEmail.trim()) {
      setEmailError('אימייל חובה.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(newReviewEmail)) {
        setEmailError('פורמט אימייל לא תקין.');
        isValid = false;
    }
    if (!newReviewText.trim()) {
      setReviewTextError('תוכן תגובה חובה.');
      isValid = false;
    }
    if (newReviewRating === 0) {
      setRatingError('אנא בחר דירוג.');
      isValid = false;
    }

    if (!currentUser) {
      sessionStorage.setItem('savedCommentData', JSON.stringify({
        text: newReviewText,
        rating: newReviewRating,
        name: newReviewName,
        email: newReviewEmail,
      }));
      sessionStorage.setItem('prefillEmailForLogin', newReviewEmail);

      setAlertDialog({
        type: 'error',
        message: 'יש להתחבר כדי לכתוב ביקורת. האם ברצונך להתחבר/להירשם עכשיו?',
        showCancel: true,
        onConfirm: () => {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          navigate('/signin');
          setAlertDialog(null);
        },
        onCancel: () => {
          sessionStorage.removeItem('savedCommentData');
          sessionStorage.removeItem('prefillEmailForLogin');
          setAlertDialog(null);
        }
      });
      isValid = false;
      return;
    }

    if (!isValid) {
      return;
    }

    try {
      const payload = {
        item_id: id,
        item_type: 'location',
        user_id: currentUserId,
        content: newReviewText,
        parent_id: null,
        rating: newReviewRating,
        created_at: new Date().toISOString(),
        user_name: newReviewName,
        user_email: newReviewEmail
      };

      // ✅ Use commentsApi
      await commentsApi.addComment(payload);

      setNewReviewStatusMessage({ type: 'success', message: 'הביקורת נשלחה בהצלחה!' });
      setNewReviewText('');
      setNewReviewRating(0);
      setNewReviewName(currentUser?.name || '');
      setNewReviewEmail(currentUser?.email || '');
      fetchComments();
    }
    catch (error) {
      console.error("נכשל בשליחת ביקורת:", error);
      setNewReviewStatusMessage({ type: 'error', message: 'שגיאה בשליחת ביקורת. אנא נסה שוב.' });
    } finally {
      setTimeout(() => setNewReviewStatusMessage(null), 3000);
    }
  };

  const handleReplySubmitted = async (parentId, content) => {
    if (!currentUser) {
      sessionStorage.setItem('savedCommentData', JSON.stringify({
        text: content,
        rating: 0,
        name: newReviewName,
        email: newReviewEmail,
        parentId: parentId
      }));
      sessionStorage.setItem('prefillEmailForLogin', newReviewEmail);

      setAlertDialog({
        type: 'error',
        message: 'יש להתחבר כדי להגיב. האם ברצונך להתחבר/להירשם עכשיו?',
        showCancel: true,
        onConfirm: () => {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          navigate('/signin');
          setAlertDialog(null);
        },
        onCancel: () => {
          sessionStorage.removeItem('savedCommentData');
          sessionStorage.removeItem('prefillEmailForLogin');
          setAlertDialog(null);
        }
      });
      return { type: 'error', message: 'יש להתחבר כדי להגיב.' };
    }
    try {
      const payload = {
        item_id: id,
        item_type: 'location',
        user_id: currentUserId,
        content: content,
        parent_id: parentId,
        created_at: new Date().toISOString(),
        rating: 0
      };

      // ✅ Use commentsApi
      await commentsApi.addComment(payload);

      setShowReplyInputId(null);
      fetchComments();
      return { type: 'success', message: 'התגובה נשלחה בהצלחה!' };
    } catch (error) {
      console.error("נכשל בשליחת תגובה:", error);
      return { type: 'error', message: 'שגיאה בשליחת תגובה. אנא נסה שוב.' };
    }
  };


  if (loading) {
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-dark-gray-text">טוען פרטי מיקום...</h2>
        <p className="text-gray-text mb-6">אנא המתן...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-red-600">שגיאה!</h2>
        <p className="text-gray-text mb-6">{error}</p>
        <RouterLink to="/" className="text-link-blue hover:underline mt-4 block">
          חזור לדף הבית
        </RouterLink>
      </div>
    );
  }

  if (!placeDetails) {
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-dark-gray-text">המיקום לא נמצא...</h2>
        <RouterLink to="/" className="text-link-blue hover:underline mt-4 block">
          חזור לדף הבית
        </RouterLink>
      </div>
    );
  }

  // Formatting the creation date
  const formattedCreatedAt = placeDetails.created_at
    ? new Date(placeDetails.created_at).toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'לא ידוע';

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 font-inter pt-16">
      {/* Custom alert modal */}
      <CustomAlertDialog
        message={alertDialog?.message}
        type={alertDialog?.type}
        onConfirm={alertDialog?.onConfirm || (() => setAlertDialog(null))}
        showCancel={alertDialog?.showCancel}
        onCancel={alertDialog?.onCancel || (() => setAlertDialog(null))}
      />
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <CustomAlertDialog
          message="האם אתה בטוח שברצונך למחוק את הפריט?"
          type="warning"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          showCancel={true}
        />
      )}

      {/* Place name - positioned and styled above the main content block */}
      <div className="flex items-center justify-center mb-6">
        <span className="text-gray-500 text-sm mr-2 flex items-center">
          <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          {currentViews}
        </span>
        <h1 className="text-xl font-bold text-golden-brown-dark">{placeDetails.name}</h1>
      </div>

      {/* Place details block - image and details */}
      <div className="flex flex-col md:flex-row items-stretch bg-white shadow-md overflow-hidden border border-gray-200">
        {/* Image carousel section - now a separate component */}
        <div className="w-full md:w-2/5 mb-2 md:mb-0 h-[200px] md:h-[50px] lg:h-[300px]">
          <PlaceImageGallery
            images={placeDetails.images}
            placeName={placeDetails.name}
            onImageClick={openImageModal}
            getImageSrc={getImageSrc}
          />
        </div>

        {/* Place details section */}
        <div className="w-full md:w-3/5 bg-white p-4 md:p-6 text-left relative rounded-b-lg md:rounded-none shadow-sm md:shadow-none border-t-4 border-golden-brown-dark md:border-t-0 mt-4 md:mt-0">
          <h3 className="text-golden-brown-dark text-lg font-semibold mb-4 pb-2 border-b-2 border-golden-brown-dark">
            פרטי מקום:
          </h3>
          <p className="text-gray-700 text-base mb-2 leading-relaxed">
            <span className="font-semibold">מיקום:</span> {placeDetails.city ? `${placeDetails.city}, ` : ''}ישראל
          </p>
          {placeDetails.category_name && (
            <p className="text-gray-700 text-base mb-2 leading-relaxed">
              <span className="font-semibold">קטגוריה:</span> {placeDetails.category_name}
            </p>
          )}
          {placeDetails.restaurantType && (
            <p className="text-gray-700 text-base mb-2 leading-relaxed">
              <span className="font-semibold">סוג מסעדה:</span> {placeDetails.restaurantType}
            </p>
          )}
          {placeDetails.kosherAuthority && (
            <p className="text-gray-700 text-base mb-2 leading-relaxed">
              <span className="font-semibold">כשרות:</span> {placeDetails.kosherAuthority}
              {placeDetails.kosherAuthority === 'other' && placeDetails.kosherAuthorityOther && (
                ` (${placeDetails.kosherAuthorityOther})`
              )}
            </p>
          )}
          <p className="text-gray-700 text-base mb-2 leading-relaxed">
            <span className="font-semibold">נוצר על ידי:</span> {placeDetails.user_name || 'אנונימי'}
          </p>
          <p className="text-gray-700 text-base mb-4 leading-relaxed">
            <span className="font-semibold">פורסם בתאריך:</span> {formattedCreatedAt}
          </p>
          <p className="text-gray-700 text-base mb-6 leading-relaxed">
            <span className="font-semibold">תיאור:</span> {placeDetails.description}
          </p>

          <div className="mt-auto pt-4 border-t border-gray-200">
            <RouterLink
              to="/"
              className="bg-golden-brown text-white font-bold py-2 px-4 hover:bg-golden-brown-dark focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border transition duration-200 text-center inline-block"
              aria-label="חזור לדף הבית"
            >
              חזור לדף הבית
            </RouterLink>
          </div>
        </div>
      </div>

      {/* New sections for "View user profile" and "Write a post about this place" */}
      <div className="mt-8 bg-white p-6 shadow-md border border-gray-200 text-center">
        <div className="flex flex-col items-center justify-center mb-4">
          {/* ✅ Fix: Change path to `/user-profile-view/${placeDetails.user_id}` */}
          <RouterLink to={`/user-profile-view/${placeDetails.user_id}`} className="text-gray-700 text-lg font-semibold px-4 bg-white relative z-10 hover:text-golden-brown-dark hover:underline transition-colors duration-200">
            הצג פרופיל משתמש
          </RouterLink>
        </div>
        <div className="flex flex-col items-center justify-center mb-6">
          <RouterLink to={`/add-post`} className="text-gray-700 text-lg font-semibold px-4 bg-white relative z-10 hover:text-golden-brown-dark hover:underline transition-colors duration-200"
          disabled={!currentUser}>
            כתוב פוסט על המקום הזה
          </RouterLink>
        </div>

        {/* Interaction section like ItemCard */}
        <div className="flex justify-between items-center mb-4 border-t pt-4 mt-4">
          {/* Like button */}
          <button onClick={handlePublicLike} className="flex items-center gap-1 hover:text-blue-600" disabled={!currentUser}>
            <FaThumbsUp size={18} />
            <span>{publicLikes}</span>
          </button>

          {/* Favorite button */}
          <button onClick={handleToggleFavorite} className="flex items-center gap-1 hover:text-red-500" disabled={!currentUser}>
            {isFavorite ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
          </button>

          {/* Report button */}
          <button onClick={() => setShowReportForm(!showReportForm)} className="flex items-center gap-1 hover:text-red-600" disabled={!currentUser}>
            <FaFlag size={18} />
            <span>דווח</span>
          </button>

          {/* Delete button (visible to creator or admin) */}
          {(currentUser && (isAdmin || currentUserId === placeDetails.user_id)) && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-red-600 hover:underline text-sm"
            >
              מחק פריט
            </button>
          )}
        </div>

        {/* ✅ Updated report form with buttons and icons for the main place */}
        {showReportForm && (
          <div className="mt-2 px-3 pb-2">
            <label htmlFor="reportReasonSelect" className="block text-gray-700 text-sm font-bold mb-2 text-right">
              בחר סיבת דיווח:
            </label>
            <div className="flex flex-col space-y-2 mb-2"> {/* Change from select to div with buttons */}
              {reportReasonsOptions.map((option) => {
                const IconComponent = option.icon; // Icon component
                if (!option.value) return null; // Don't display "Select reason" option as a button
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setReportReason(option.value);
                      setShowCustomReportReasonInput(option.value === 'other');
                      setReportReasonError('');
                    }}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition duration-200 text-right ${
                      reportReason === option.value
                        ? 'bg-golden-brown text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {IconComponent && <IconComponent size={16} />}
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
            {reportReasonError && <p className="text-red-500 text-xs mt-1 text-right">{reportReasonError}</p>}

            {showCustomReportReasonInput && (
              <textarea
                value={customReportReason}
                onChange={(e) => setCustomReportReason(e.target.value)}
                placeholder="אנא פרט את סיבת הדיווח..."
                className="w-full border p-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-golden-brown-light mt-2"
                rows="3"
              />
            )}
            <button onClick={handleReportSubmit} className="mt-3 bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:shadow-outline transition duration-200">
              שלח דיווח
            </button>
          </div>
        )}

        {/* View count */}
        <div className="flex items-center gap-1 text-gray-500 text-sm mt-4">
          <FaEye size={18} />
          <span>{currentViews} צפיות</span>
        </div>

        {/* Share buttons - now a separate component */}
        <ShareButtons itemUrl={window.location.href} title={placeDetails.name} />
      </div>


      {/* User reviews section */}
      <div className="mt-8 bg-white p-6 shadow-md border border-gray-200">
        <div className="flex items-center justify-center mb-6 relative">
          <span className="absolute left-0 right-0 h-0.5 bg-golden-brown-dark"></span>
          <h3 className="text-golden-brown-dark text-lg font-semibold px-4 bg-white relative z-10">
            ביקורות משתמשים
          </h3>
        </div>

        {/* Overall rating section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 mb-2">
            <span className="text-4xl font-bold text-dark-gray-text">{averageRating}</span>
          </div>
          <p className="text-sm text-gray-500 mb-2">דירוג המקום</p>
          <div className="flex space-x-0.5" dir="ltr">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} filled={i < Math.floor(parseFloat(averageRating))} />
            ))}
          </div>
          {ratingError && <p className="text-red-500 text-xs mt-1">{ratingError}</p>}
        </div>

        {/* New review status message */}
        {newReviewStatusMessage && (
            <div className={`mb-4 p-3 text-center ${newReviewStatusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {newReviewStatusMessage.message}
            </div>
        )}

        {/* Individual Reviews - now using the split CommentItem component */}
        <div className="space-y-0">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <React.Fragment key={review.id}>
                {index > 0 && (
                  <div className="border-t border-gray-200 my-4"></div>
                )}
                <CommentItem
                  comment={review}
                  onReplySubmitted={handleReplySubmitted}
                  activeReplyId={showReplyInputId}
                  onToggleReplyInput={setShowReplyInputId}
                  currentUser={currentUser} // ✅ Pass currentUser
                  onReportComment={handleCommentReport} // ✅ Pass report function
                  reportReasonsOptions={reportReasonsOptions} // ✅ Pass report options
                />
              </React.Fragment>
            ))
          ) : (
            <p className="text-center text-gray-500">עדיין אין ביקורות עבור מיקום זה.</p>
          )}
        </div>

        {/* Add new comment section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-golden-brown-dark text-lg font-semibold mb-4 text-left">
            השאר תגובה
          </h3>
          <div className="flex flex-col items-center mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2 text-center">
              הדירוג שלך:
            </label>
            <div className="flex justify-center" dir="ltr">
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ display: 'inline-block', cursor: 'pointer', touchAction: 'manipulation' }} onClick={() => setNewReviewRating(i + 1)}>
                  <StarIcon filled={i < newReviewRating} />
                </span>
              ))}
            </div>
            {newReviewRating === 0 && (
              <p className="text-sm text-gray-500 mt-1 text-center">לא דורג</p>
            )}
            {ratingError && <p className="text-red-500 text-xs mt-1">{ratingError}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="newReviewName" className="block text-gray-700 text-sm font-bold mb-2 text-left">
              שם: (חובה)
            </label>
            <input
              type="text"
              id="newReviewName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-relaxed focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
              placeholder=""
              value={newReviewName}
              onChange={(e) => setNewReviewName(e.target.value)}
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="newReviewEmail" className="block text-gray-700 text-sm font-bold mb-2 text-left">
              אימייל: (חובה)
            </label>
            <input
              type="email"
              id="newReviewEmail"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-relaxed focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
              placeholder=""
              value={newReviewEmail}
              onChange={(e) => setNewReviewEmail(e.target.value)}
            />
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="newReviewText" className="block text-gray-700 text-sm font-bold mb-2 text-left">
              כתוב תגובה:
            </label>
            <textarea
              id="newReviewText"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-relaxed focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
              rows="5"
              placeholder=""
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
            ></textarea>
            {reviewTextError && <p className="text-red-500 text-xs mt-1">{reviewTextError}</p>}
          </div>
          <div className="flex justify-start">
            <button
              onClick={handleNewReviewSubmit}
              className="bg-golden-brown text-white font-bold py-2 px-4 hover:bg-golden-brown-dark focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border transition duration-200"
            >
              שלח
            </button>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeImageModal}>
            <div className="relative max-w-3xl max-h-full overflow-auto" onClick={e => e.stopPropagation()}>
              <button className="absolute top-2 right-2 text-white text-3xl font-bold" onClick={closeImageModal}>&times;</button>
              <img src={getImageSrc(selectedImage)} alt="נבחר" className="max-w-full max-h-full object-contain"/>
            </div>
        </div>
      )}
    </div>
  );
};

export default PlaceDetail;
