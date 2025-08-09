import React, { useState, useEffect, useContext , useRef} from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    FaFacebookF, FaTwitter, FaWhatsapp,
    FaThumbsUp, FaRegThumbsUp,
    FaHeart, FaRegHeart,
    FaLink, FaFlag, FaEye,
    FaEdit, FaTrash,
    FaEllipsisV, // אייקון שלוש נקודות
    FaUser // ייבוא FaUser
} from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserLikedItems, toggleVote, fetchPublicLikesCounts, selectTotalLikes, selectIsLiked } from '../features/likes/likesSlice';
import { toggleFavorite, selectFavorites } from '../features/posts/favoritesSlice';
import { AuthContext } from '../layouts/AuthLayout'; // ייבוא AuthContext

// ייבוא אייקונים מ-lucide-react לסיבות דיווח
import {
    Frown, MegaphoneOff, AlertTriangle, Ban, MapPinOff, Copy, Lock, ImageOff, DollarSign, Edit,
} from 'lucide-react';


// Custom Alert/Confirm Modal Component - Replaces all alert() and confirm()
const CustomAlertDialog = ({ message, type, onConfirm, onCancel, showCancel = false }) => {
    if (!message) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 shadow-lg border border-gray-200 w-80 text-center">
                <p className={`text-lg font-semibold mb-4 ${type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                </p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white ${type === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                        OK
                    </button>
                    {showCancel && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-300 text-gray-800 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const ShareButtons = ({ itemUrl, title = "Check this out!" }) => {
    const [alertMessage, setAlertMessage] = useState(null); // State for custom alert
    const encodedUrl = encodeURIComponent(itemUrl);
    const encodedTitle = encodeURIComponent(title);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(itemUrl);
            setAlertDialog({ type: 'success', message: '✅ הקישור הועתק!' });
        } catch (err) {
            setAlertDialog({ type: 'error', message: '❌ נכשל בהעתקה' });
        } finally {
            setTimeout(() => setAlertDialog(null), 3000); // Clear message after 3 seconds
        }
    };

    return (
        <div className="flex gap-4 items-center text-gray-600 text-sm">
            {/* <span className="font-medium">שתף:</span> */}
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
            {/* Display custom alert modal */}
            <CustomAlertDialog
                message={alertMessage?.message}
                type={alertMessage?.type}
                onConfirm={() => setAlertDialog(null)}
            />
        </div>
    );
};

// הגדרת סיבות דיווח מוגדרות מראש עם אייקונים
const reportReasonsOptions = [
    { label: 'תוכן פוגעני או מעליב', value: 'offensive', icon: Frown },
    { label: 'דברי שנאה או הסתה', value: 'hate_speech', icon: MegaphoneOff },
    { label: 'מידע שגוי או מטעה', value: 'misleading_info', icon: AlertTriangle },
    { label: 'תוכן לא ראוי/בלתי הולם', value: 'inappropriate_content', icon: Ban },
    { label: 'מיקום שגוי או לא קיים', value: 'wrong_location', icon: MapPinOff },
    { label: 'תוכן כפול או ספאם', value: 'spam', icon: Copy },
    { label: 'פגיעה בפרטיות או מידע רגיש', value: 'privacy_violation', icon: Lock },
    { label: 'תמונות לא רלוונטיות / מועתקות', value: 'irrelevant_images', icon: ImageOff },
    { label: 'פרסום מסחרי לא מורשה', value: 'unauthorized_commercial', icon: DollarSign },
    { label: 'אחר (פרט)', value: 'other', icon: Edit },
];


const ItemCard = ({
    title,
    description,
    images = [],
    userName,
    userId: creatorId, // שינוי שם המשתנה מ-userId ל-creatorId כדי למנוע התנגשות
    createdAt,
    commentsCount,
    itemUrl,
    itemId,
    views,
    itemType = 'post',
    category,
    location,
    onSelect,
    isSelected,
    onDeleteSuccess // ✅ קבלת פונקציית קריאה חוזרת למחיקה
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // קבלת userId ו-currentUser מה-AuthContext
    const { userId: currentUserId, currentUser } = useContext(AuthContext);
    const isAdmin = currentUser?.role === 'admin'; // קביעת isAdmin מהקונטקסט

    const likedItems = useSelector(selectUserLikedItems);
    const liked = likedItems[itemId];
    const favorites = useSelector(selectFavorites);
    const isFavorite = !!favorites[itemId];

    const [publicLikes, setPublicLikes] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportReason, setReportReason] = useState(''); // לסיבה שנבחרה מתוך האפשרויות
    const [customReportReason, setCustomReportReason] = useState(''); // לסיבה מותאמת אישית (כאשר 'אחר' נבחר)
    const [reportReasonError, setReportReasonError] = useState(''); // שגיאה עבור בחירת סיבת דיווח
    const [showCustomReportReasonInput, setShowCustomReportReasonInput] = useState(false); // הצגת שדה טקסט לסיבה מותאמת אישית

    const [showDeleteModal, setShowDeleteModal] = useState(false); // ✅ סטייט למודאל מחיקה
    const [alertDialog, setAlertDialog] = useState(null); // להתראות מותאמות אישית
    const [showOptionsMenu, setShowOptionsMenu] = useState(false); // תפריט האפשרויות הימני
    const [currentViews, setCurrentViews] = useState(views);
const hasSentView = useRef(false); // זה דגל לבדיקה אם כבר נשלחה צפייה

    // פורמט תאריך כפי שמוצג בתמונה: DD/MM/YY
    const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    }).replace(/\//g, '/') : 'לא סופק';

    const getImageSrc = (imageName) => {
        if (!imageName) return '';
        if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
            return imageName;
        }
        return `http://localhost:3001/uploads/${imageName}`;
    };

    useEffect(() => {
        if (!itemId || !itemType) return;
        const fetchPublicLikes = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/votes/${itemType}/${itemId}`);
                const data = await res.json();
                setPublicLikes(data.totalLikes);
            } catch (err) {
                console.error('Failed to fetch public likes count:', err);
            }
        };
        fetchPublicLikes();
    }, [itemId, itemType]);

    const handlePublicLike = async () => {
        if (!currentUserId) {
            setAlertDialog({ type: 'error', message: 'יש להתחבר כדי לבצע לייק לפריט זה.' });
            setTimeout(() => setAlertDialog(null), 3000);
            return;
        }
        try {
            if (liked) {
                await fetch(`http://localhost:3001/api/votes/${currentUserId}/${itemType}/${itemId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                });
                dispatch({ type: 'likes/toggleVote/fulfilled', payload: { itemId, totalLikes: publicLikes - 1, newLikedStatus: false } });
            } else {
                await fetch('http://localhost:3001/api/votes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: currentUserId,
                        item_type: itemType,
                        item_id: itemId,
                        value: 1
                    })
                });
                dispatch({ type: 'likes/toggleVote/fulfilled', payload: { itemId, totalLikes: publicLikes + 1, newLikedStatus: true } });
            }

            const res = await fetch(`http://localhost:3001/api/votes/${itemType}/${itemId}`);
            const data = await res.json();
            setPublicLikes(data.totalLikes);
        } catch (err) {
            console.error('שגיאה בשליחת לייק:', err);
            setAlertDialog({ type: 'error', message: 'שגיאה בשליחת לייק. אנא נסה שוב.' });
        } finally {
            setTimeout(() => setAlertDialog(null), 3000);
        }
    };

    const handleToggleFavorite = () => {
        if (!currentUserId) {
            setAlertDialog({ type: 'error', message: 'יש להתחבר כדי להוסיף פריטים למועדפים.' });
            setTimeout(() => setAlertDialog(null), 3000);
            return;
        }
        dispatch(toggleFavorite(itemId));
        setAlertDialog({ type: 'success', message: `פריט ${isFavorite ? 'הוסר מ' : 'נוסף ל'}מועדפים!` });
        setTimeout(() => setAlertDialog(null), 3000);
    };

    const handleDelete = async () => {
        setShowDeleteModal(false); // סגור את מודאל האישור
        if (!currentUserId) {
            setAlertDialog({ type: 'error', message: 'יש להתחבר כדי למחוק פריטים.' });
            setTimeout(() => setAlertDialog(null), 3000);
            return;
        }
        console.log(`ItemCard: Attempting to delete item ID: ${itemId}, Type: ${itemType}`);
        try {
            // שליחת userId ו-role (מהקונטקסט) כפרמטרי שאילתה
            const res = await fetch(`http://localhost:3001/api/${itemType}s/${itemId}?userId=${currentUserId}&role=${isAdmin ? 'admin' : 'user'}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                console.log(`ItemCard: Delete request for item ID ${itemId} successful.`);
                setAlertDialog({ type: 'success', message: 'הפריט נמחק בהצלחה!' });
                // ✅ קריאה לפונקציית הקריאה החוזרת onDeleteSuccess
                if (onDeleteSuccess) {
                    console.log(`ItemCard: Calling onDeleteSuccess for item ID: ${itemId}`);
                    onDeleteSuccess(itemId);
                } else {
                    console.warn("ItemCard: onDeleteSuccess prop is not provided.");
                }
            } else {
                const errorData = await res.json();
                console.error(`ItemCard: Delete request for item ID ${itemId} failed with status ${res.status}:`, errorData);
                setAlertDialog({ type: 'error', message: errorData.error || 'מחיקה נכשלה.' });
            }
        } catch (err) {
            console.error('ItemCard: שגיאה במחיקה:', err);
            setAlertDialog({ type: 'error', message: 'שגיאה במחיקה. אנא נסה שוב.' });
        } finally {
            setTimeout(() => setAlertDialog(null), 3000);
        }
    };

    // useEffect(() => {
    //     if (!itemId) return;
    //     const viewedKey = `viewed-${itemType}-${itemId}`;
    //     if (sessionStorage.getItem(viewedKey)) return;

    //     fetch(`http://localhost:3001/api/${itemType}s/${itemId}/view`, {
    //         method: 'POST',
    //     })
    //         .then(res => res.json())
    //         .then(data => {
    //             if (data.views !== undefined) {
    //                 setCurrentViews(data.views);
    //                 sessionStorage.setItem(viewedKey, 'true');
    //             }
    //         })
    //         .catch(err => console.error('Error updating views:', err));
    // }, [itemId, itemType]);
// useEffect(() => {
//   console.log('useEffect triggered:', { itemType, itemId });

//   if (!itemId || !itemType) {
//     console.log('useEffect aborted because itemId or itemType is missing');
//     return;
//   }

//   const viewedKey = `viewed-${itemType}-${itemId}`;
//   if (sessionStorage.getItem(viewedKey)) {
//     console.log('Already viewed in this session:', viewedKey);
//     return;
//   }

//   const updateViews = async () => {
//     try {
//       console.log('Calling API to update views for:', viewedKey);
//       const res = await fetch(`http://localhost:3001/api/${itemType}s/${itemId}/view`, { method: 'POST' });
//       const data = await res.json();
//       console.log('API response:', data);
//       if (data.views !== undefined) {
//         setCurrentViews(data.views);
//         sessionStorage.setItem(viewedKey, 'true');
//       }
//     } catch (err) {
//       console.error('Error updating views:', err);
//     }
//   };

//   updateViews();
// }, [itemId, itemType]);
// useEffect(() => {
//   console.log('✅ useEffect triggered for views:', itemType, itemId);

//   if (!itemId || !itemType) return;

//   const viewedKey = `viewed-${itemType}-${itemId}`;

//   if (sessionStorage.getItem(viewedKey)) {
//     console.log('⛔ כבר נצפה:', viewedKey);
//     return;
//   }

//   const updateViews = async () => {
//     console.log('📡 שולח בקשת צפייה לשרת:', viewedKey);
//     const res = await fetch(`http://localhost:3001/api/${itemType}s/${itemId}/view`, { method: 'POST' });
//     const data = await res.json();
//     if (data.views !== undefined) {
//       setCurrentViews(data.views);
//       sessionStorage.setItem(viewedKey, 'true');
//     }
//   };

//   updateViews();
// }, [itemId, itemType]);
useEffect(() => {
  if (!itemId || !itemType) return;

  const viewedKey = `viewed-${itemType}-${itemId}`;

  // רשום מיד כדי למנוע מרינדור כפול לשלוח שוב
  if (sessionStorage.getItem(viewedKey) === 'true') {
    console.log('⛔ כבר נצפה:', viewedKey);
    return;
  }

  sessionStorage.setItem(viewedKey, 'true'); // שומר לפני הקריאה לשרת

  const updateViews = async () => {
    console.log('📡 שולח בקשת צפייה לשרת:', viewedKey);
    try {
      const res = await fetch(`http://localhost:3001/api/${itemType}s/${itemId}/view`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.views !== undefined) {
        setCurrentViews(data.views);
      }
    } catch (error) {
      console.error('⚠️ שגיאה בשליחת צפייה:', error);
    }
  };

  updateViews();
}, [itemId, itemType]);



    const handleReportSubmit = async () => {
        // איפוס שגיאות דיווח
        setReportReasonError('');

        if (!currentUserId) {
            setAlertDialog({ type: 'error', message: 'יש להתחבר כדי לדווח על פריטים.' });
            setTimeout(() => setAlertDialog(null), 3000);
            return;
        }

        let finalReason = reportReason;
        if (reportReason === 'other') {
            if (!customReportReason.trim()) {
                setReportReasonError('אנא פרט את סיבת הדיווח.');
                return;
            }
            finalReason = `Other: ${customReportReason.trim()}`;
        } else if (!reportReason) {
            setReportReasonError('אנא בחר סיבת דיווח.');
            return;
        }

        try {
            const res = await fetch('http://localhost:3001/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_type: itemType,
                    item_id: itemId,
                    user_id: currentUserId,
                    reason: finalReason // השתמש בסיבה הסופית
                })
            });

            if (res.ok) {
                setAlertDialog({ type: 'success', message: '✅ הדיווח נשלח בהצלחה!' });
                setShowReportForm(false);
                setReportReason('');
                setCustomReportReason('');
                setShowCustomReportReasonInput(false);
            } else {
                setAlertDialog({ type: 'error', message: '❌ נכשל בשליחת דיווח.' });
            }
        } catch (err) {
            console.error('שגיאה בשליחת דיווח:', err);
            setAlertDialog({ type: 'error', message: 'שגיאה בשליחת דיווח. אנא נסה שוב.' });
        } finally {
            setTimeout(() => setAlertDialog(null), 3000);
        }
    };

    // Carousel navigation functions
    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            (prevIndex - 1 + images.length) % images.length
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            (prevIndex + 1) % images.length
        );
    };

    // פונקציה לטיפול בניווט לעריכה
    const handleEdit = () => {
        setShowOptionsMenu(false);
        if (itemType === 'location') {
            navigate(`/add-place/${itemId}?type=location`);
        } else if (itemType === 'post') {
            navigate(`/add-post/${itemId}?type=post`);
        }
    };

    // פונקציה לטיפול בניווט לפרופיל יוצר
    const handleViewCreatorProfile = () => {
        setShowOptionsMenu(false);
        navigate(`/user-profile-view/${creatorId}`); 
    };

    // פונקציה לטיפול בבחירת סיבת דיווח
    const handleReportReasonChange = (value) => {
        setReportReason(value);
        setReportReasonError(''); // נקה שגיאות כאשר נבחרת סיבה
        setShowCustomReportReasonInput(value === 'other'); // הצג שדה טקסט אם נבחר 'אחר'
        if (value !== 'other') {
            setCustomReportReason(''); // נקה סיבה מותאמת אישית אם לא נבחר 'אחר'
        }
    };

    // קביעת אם כפתורי העריכה/מחיקה צריכים להיות גלויים
    const canEditOrDelete = currentUserId && (currentUserId === creatorId || isAdmin);


    return (
        <div
            className={`w-full max-w-xl mx-auto my-4 border border-[#b8860b] bg-white shadow-sm overflow-hidden flex flex-col relative min-h-[340px] p-4 ${isSelected && onSelect ? 'shadow-md ring-2 ring-golden-brown-light' : ''}`}
            style={{ cursor: 'default' }}
        >
            <CustomAlertDialog
                message={alertDialog?.message}
                type={alertDialog?.type}
                onConfirm={() => setAlertDialog(null)}
                showCancel={false}
            />
            {showDeleteModal && (
                <CustomAlertDialog
                    message="האם אתה בטוח שברצונך למחוק את הפריט?"
                    type="warning"
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteModal(false)}
                    showCancel={true}
                />
            )}

            <div className="absolute top-2 left-2 flex items-center gap-1 text-gray-500 text-xs z-10 bg-white bg-opacity-75 px-1">
                <FaEye size={14} />
                <span>{currentViews}</span>
            </div>

            {/* תפריט שלוש נקודות (אפשרויות) - זהו התפריט הימני שאת רוצה לשמור */}
            {canEditOrDelete && (
                <div className="absolute top-2 right-2 z-20">
                    <button
                        onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                        className="p-1 text-gray-600 hover:text-gray-800 focus:outline-none"
                        aria-label="אפשרויות"
                    >
                        <FaEllipsisV size={18} />
                    </button>
                    {showOptionsMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                            <button
                                onClick={handleEdit}
                                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                                <FaEdit /> ערוך
                            </button>
                            <button
                                onClick={() => { setShowDeleteModal(true); setShowOptionsMenu(false); }}
                                className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                            >
                                <FaTrash /> מחק
                            </button>
                            {/* כפתור "צפה בפרופיל יוצר" בתפריט הימני */}
                            <button
                                onClick={handleViewCreatorProfile}
                                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                                <FaUser /> צפה בפרופיל יוצר
                            </button>
                            {/* ✅ כפתור "דיווח" הוסר מכאן, חזר למטה */}
                        </div>
                    )}
                </div>
            )}

            <div className="w-full text-center pt-2 pb-1">
                <h2 className="text-2xl font-bold text-[#8B4513] mb-2">{title}</h2>
            </div>

            <div className="flex flex-col md:flex-row w-full flex-grow">
                <div className="w-full md:w-2/5 flex flex-col items-center justify-center relative p-2">
                    {images.length > 0 ? (
                        <>
                            <div className="w-full h-48 md:h-full flex items-center justify-center relative">
                                <img
                                    src={getImageSrc(images[currentImageIndex])}
                                    alt={title}
                                    className="object-contain w-full h-full bg-gray-100 text-white"
                                    style={{ background: '#F3F4F6', color: 'white' }}
                                />
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[#8B4513] text-white p-1 text-xl cursor-pointer hover:bg-[#b8860b]"
                                            aria-label="Previous image"
                                        >
                                            &#10094;
                                        </button>
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#8B4513] text-white p-1 text-xl cursor-pointer hover:bg-[#b8860b]"
                                            aria-label="Next image"
                                        >
                                            &#10095;
                                        </button>
                                    </>
                                )}
                            </div>
                            {images.length > 1 && (
                                <div className="flex justify-center mt-1 space-x-1">
                                    {images.map((_, idx) => (
                                        <span
                                            key={idx}
                                            className={`block w-2 h-2 cursor-pointer ${idx === currentImageIndex ? 'bg-[#b8860b]' : 'bg-gray-400'}`}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            aria-label={`Go to image ${idx + 1}`}
                                        ></span>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-48 md:h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-500">אין תמונה זמינה</span>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-3/5 px-4 py-2 flex flex-col justify-start text-left overflow-hidden">
                    <p className="text-base text-gray-800 mb-3">{description}</p>
                    <div className="text-sm text-gray-600 mb-1.5">קטגוריה: <span className="font-semibold">{category ? category : 'לא סופק'}</span></div>
                    <div className="text-sm text-gray-600 mb-1.5">מיקום: <span className="font-semibold">{location ? location : 'לא סופק'}</span></div>
                    <div className="text-sm text-gray-500 mb-1.5">נוצר בתאריך: {formattedDate}</div>
                    <div className="text-sm text-gray-500 mb-1.5">נוצר על ידי: {userName || 'אנונימי'}</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between w-full px-4 py-2 border-t border-gray-300 bg-white">
                <div className="flex gap-2 items-center text-gray-600 text-sm mb-1 md:mb-0">
                    {itemUrl && <ShareButtons itemUrl={itemUrl} title={title} />}
                </div>

                <div className="flex-grow text-center mb-1 md:mb-0">
                    <RouterLink
                        to={itemUrl}
                        className="inline-block border border-[#b8860b] bg-white text-[#8B4513] font-bold py-2 px-4 hover:bg-[#fff8e1] transition duration-200 text-sm"
                        style={{ minWidth: 120, cursor: 'pointer' }}
                    >
                        קרא עוד
                    </RouterLink>
                </div>

                {/* ✅ כפתורי הלייק והמועדפים חזרו לכאן */}
                <div className="flex gap-2 items-center text-gray-600 text-sm">
                    <button onClick={handlePublicLike} className="flex items-center gap-0.5 hover:text-blue-600" disabled={!currentUserId}>
                        {liked ? <FaThumbsUp size={16} className="text-blue-600" /> : <FaRegThumbsUp size={16} />}
                        <span>{publicLikes}</span>
                    </button>
                    <button onClick={handleToggleFavorite} className="flex items-center gap-0.5 hover:text-red-500" disabled={!currentUserId}>
                        {isFavorite ? <FaHeart size={16} className="text-red-500" /> : <FaRegHeart size={16} />}
                    </button>
                    {/* ✅ כפתור דיווח חזר לכאן */}
                    <button onClick={() => setShowReportForm(!showReportForm)} className="flex items-center gap-0.5 hover:text-red-600" disabled={!currentUserId}>
                        <FaFlag size={16} />
                        <span>דיווח</span>
                    </button>
                </div>
            </div>

            {/* טופס דיווח - יוצג רק אם showReportForm הוא true */}
            {showReportForm && (
                <div className="mt-1 px-4 pb-2 w-full bg-gray-50 border-t border-gray-200 py-4">
                    <h4 className="text-md font-semibold text-gray-800 mb-3 text-right">בחר סיבת דיווח:</h4>
                    <div className="flex flex-col space-y-2">
                        {reportReasonsOptions.map((option) => {
                            const IconComponent = option.icon;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleReportReasonChange(option.value)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition duration-150 ease-in-out text-right ${
                                        reportReason === option.value
                                            ? 'bg-golden-brown text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {IconComponent && <IconComponent size={16} />}{/* Render the icon */}
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
                    <button onClick={() => setShowReportForm(false)} className="mt-3 mr-2 bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 focus:outline-none focus:shadow-outline transition duration-200">
                        בטל
                    </button>
                </div>
            )}
        </div>
    );
};

export default ItemCard;