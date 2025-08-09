import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import axios from 'axios';
import { AuthContext } from '../layouts/AuthLayout';
import { FaPlusCircle, FaSave, FaTimesCircle, FaUpload } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid'; // לייצר ID ייחודי לתמונות זמניות
import { useSelector, useDispatch } from 'react-redux'; // ✅ ייבוא Redux hooks
import { 
  fetchCategories, 
  selectAllCategories, // נשתמש בזה כדי למצוא את הקטגוריה "אחר" לפי השם
  selectPostCategories, // ✅ ייבוא סלקטור לקטגוריות פוסטים
  selectCategoriesLoading, 
  selectCategoriesError 
} from '../features/categories/categoriesSlice'; // ✅ ייבוא מ-categorySlice
import draftsApi from '../api/draftsApi'; 
import { uploadTempImages } from '../api/uploadApi'; 
import postsApi from '../api/postsApi'; 
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

const AddPostPage = () => {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const { draftId: paramId } = useParams();

  const dispatch = useDispatch(); // ✅ אתחול useDispatch

  // ✅ אחזור קטגוריות מ-Redux
  const categories = useSelector(selectPostCategories); // ✅ שימוש בסלקטור לקטגוריות פוסטים
  const allCategories = useSelector(selectAllCategories); // נצטרך את כל הקטגוריות למצוא את "אחר"
  const categoriesLoading = useSelector(selectCategoriesLoading);
  const categoriesError = useSelector(selectCategoriesError);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [locationId, setLocationId] = useState(''); 
  const [images, setImages] = useState([]); 
  const [existingImages, setExistingImages] = useState([]); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [alertDialog, setAlertDialog] = useState(null);

  const [draftId, setDraftId] = useState(null); 
  const [isEditingExistingPost, setIsEditingExistingPost] = useState(false); 

  // ✅ טעינת קטגוריות כאשר הקומפוננטה נטענת
  useEffect(() => {
    dispatch(fetchCategories('post')); // טען קטגוריות מסוג 'post'
  }, [dispatch]);

  // ✅ טען נתוני פוסט או טיוטה אם יש ID ב-URL
  useEffect(() => {
    const loadPostOrDraft = async () => {
      console.log("AddPostPage useEffect triggered. paramId:", paramId); 

      if (paramId) { 
        setLoading(true);
        setError(null);
        setDraftId(null); 
        setIsEditingExistingPost(false); 

        try {
          // נסה לטעון פוסט קיים
          // const postResponse = await axios.get(`http://localhost:3001//posts/${paramId}`);
          const postData = await postsApi.fetchPostById(paramId);
          console.log("Loaded existing post data:", postData); 
          setTitle(postData.title || '');
          setContent(postData.content || '');
          setCategory(postData.category_id || '');
          setLocationId(postData.location_id || '');
          setExistingImages(postData.images || []);
          setImages([]); 
          setIsEditingExistingPost(true); 
          setLoading(false);

        } catch (postErr) {
          // אם לא נמצא פוסט, נסה לטעון טיוטה
          console.warn('Post not found, trying to load as draft:', postErr);
          try {
            const draftResponse = await draftsApi.getDraftById(paramId);
            console.log("Draft response data:", draftResponse.data);
            // const draftResponse = await axios.get(`http://localhost:3001/api/drafts/${paramId}`);
            console.log("Raw draft response data:", draftResponse.data); 
            const draftData = draftResponse.data.data; 
            console.log("Extracted draftData for form:", draftData); 
            
            setDraftId(paramId); 
            setTitle(draftData.title || '');
            setContent(draftData.content || '');
            setCategory(draftData.category_id || '');
            setLocationId(draftData.location_id || '');
            setExistingImages(draftData.images || []);
            setImages([]); 
            setLoading(false);

          } catch (draftErr) {
            console.error('Failed to load post or draft:', draftErr);
            setAlertDialog({ type: 'error', message: 'נכשל בטעינת הפוסט/טיוטה לעריכה.' });
            setLoading(false);
          }
        }
      } else {
        // מצב הוספה חדשה - אפס את כל השדות
        setTitle('');
        setContent('');
        setCategory('');
        setLocationId('');
        setImages([]);
        setExistingImages([]);
        setDraftId(null);
        setIsEditingExistingPost(false);
        setLoading(false);
      }
    };
    loadPostOrDraft();
  }, [paramId]); 

  // ✅ הסרת מערך הקטגוריות המקומי
  // const categories = [
  //   { id: '1', name: 'חדשות' },
  //   { id: '2', name: 'אירועים' },
  //   { id: '3', name: 'מתכונים' },
  //   { id: '4', name: 'טיפים' },
  //   { id: '5', name: 'אחר' },
  // ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleRemoveImage = (indexToRemove, isExisting = false) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    } else {
      setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError('כותרת הפוסט היא שדה חובה.');
      return false;
    }
    if (!content.trim()) {
      setError('תוכן הפוסט הוא שדה חובה.');
      return false;
    }
    if (!category) {
      setError('יש לבחור קטגוריה.');
      return false;
    }
    // ✅ מצא את ה-ID של קטגוריית "אחר" באופן דינמי
    const otherCategory = allCategories.find(cat => cat.id === category && cat.name === 'אחר' && cat.type === 'post');
    if (otherCategory && category === otherCategory.id) {
        // אם קטגוריית "אחר" נבחרה, אך אין שדה מותאם אישית עבורה, נצטרך להוסיף כאן בדיקה אם יש צורך בשדה כזה.
        // כרגע אין שדה customCategoryName בפוסטים, אז אין צורך בבדיקה נוספת.
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!isDraft && !validateForm()) {
      setLoading(false);
      return;
    }

    if (!userId) {
      setAlertDialog({ type: 'error', message: 'יש להתחבר כדי להוסיף פוסט.' });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('user_id', userId);
    formData.append('category_id', category);
    if (locationId) formData.append('location_id', locationId);
    
    // הוסף תמונות קיימות (שמות קבצים)
    if (existingImages.length > 0) {
      formData.append('existing_images', JSON.stringify(existingImages));
    }

    // הוסף קבצי תמונה חדשים
    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      if (isDraft) {
        let finalImagesForDraft = [...existingImages]; 

        // 1. Upload new images if any are selected
        if (images.length > 0) {
            const imageUploadFormData = new FormData();
            images.forEach(image => {
                imageUploadFormData.append('images', image);
            });
            try {
                // const uploadRes = await axios.post('http://localhost:3001/api/upload-temp-images', imageUploadFormData, {
                //     headers: {
                //         'Content-Type': 'multipart/form-data',
                //     },
                // });
                const uploadRes = await uploadTempImages(imageUploadFormData);
                const uploadedFilenames = uploadRes.data.filenames; 
                finalImagesForDraft = [...finalImagesForDraft, ...uploadedFilenames];
                setImages([]); 
                setExistingImages(finalImagesForDraft); 
            } catch (uploadErr) {
                console.error('Failed to upload new images for draft:', uploadErr);
                setAlertDialog({ type: 'error', message: 'נכשל בהעלאת תמונות לטיוטה.' });
                setLoading(false);
                return; 
            }
        }

        // 2. Construct and send the draft payload with all image filenames
        const draftPayload = {
          draftId: draftId || paramId, 
          type: 'post',
          data: {
            title, content, user_id: userId, category_id: category, location_id: locationId,
            images: finalImagesForDraft 
          }
        };
        // const res = await axios.post('http://localhost:3001/api/drafts', draftPayload);
        const res = await draftsApi.saveDraft(draftPayload);
        setDraftId(res.data.id); 
        setAlertDialog({ type: 'success', message: 'הטיוטה נשמרה בהצלחה!' });
      } else if (isEditingExistingPost) { 
        // const res = await axios.put(`http://localhost:3001/api/posts/${paramId}`, formData, {
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //   },
        // });
        const res = await postsApi.updatePost(paramId, formData);
        setSuccessMessage('הפוסט עודכן בהצלחה!');
        setAlertDialog({ type: 'success', message: 'הפוסט עודכן בהצלחה!' });
        navigate('/my-posts'); 
      } else { 
        // const res = await axios.post('http://localhost:3001/api/posts', formData, {
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //   },
        // });
        const res = await postsApi.createPost(formData);
        setSuccessMessage('הפוסט נוסף בהצלחה!');
        setAlertDialog({ type: 'success', message: 'הפוסט נוסף בהצלחה!' });
        // אם פורסם בהצלחה, מחק את הטיוטה אם קיימת
        if (draftId) {
          await draftsApi.deleteDraft(draftId);
          // await axios.delete(`http://localhost:3001/api/drafts/${draftId}`);
          console.log('Draft deleted after publishing.');
        }
        navigate('/my-posts'); 
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      const errorMessage = err.response?.data?.error || `שגיאה בשמירת הפוסט: ${err.message || ''}`;
      setAlertDialog({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
      setTimeout(() => setAlertDialog(null), 3000);
    }
  };

  if (loading || categoriesLoading === 'pending') { // ✅ הוספת מצב טעינה לקטגוריות
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-dark-gray-text">טוען...</h2>
        <p className="text-gray-text mb-6">אנא המתן...</p>
      </div>
    );
  }

  if (categoriesError) { // ✅ טיפול בשגיאת טעינת קטגוריות
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-red-600">שגיאה בטעינת קטגוריות</h2>
        <p className="text-red-500 mb-6">{categoriesError}</p>
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

      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
        {isEditingExistingPost ? 'ערוך פוסט' : (draftId ? 'ערוך טיוטה (פוסט)' : 'הוסף פוסט חדש')}
      </h2>

      <form onSubmit={(e) => handleSubmit(e, false)} className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

        {/* כותרת הפוסט */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
            כותרת הפוסט: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* תוכן הפוסט */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">
            תוכן הפוסט: <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            required
          ></textarea>
        </div>

        {/* קטגוריה */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
            קטגוריה: <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">בחר קטגוריה</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* מיקום משויך (אופציונלי) */}
        <div className="mb-4">
          <label htmlFor="locationId" className="block text-gray-700 text-sm font-bold mb-2">
            הוסף קישור למיקום (ID): 
          </label>
          <input
            type="text"
            id="locationId"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            placeholder="הכנס ID של מיקום קיים"
          />
        </div>

        {/* תמונות קיימות (לטיוטות/עריכה) */}
        {existingImages.length > 0 && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              תמונות קיימות:
            </label>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((imageName, index) => (
                <div key={imageName || index} className="relative w-24 h-24 border rounded overflow-hidden">
                  <img
                    src={`http://localhost:3001/uploads/${imageName}`} 
                    alt={`Existing image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index, true)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    aria-label="הסר תמונה קיימת"
                  >
                    <FaTimesCircle />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* העלאת תמונות חדשות */}
        <div className="mb-6">
          <label htmlFor="images" className="block text-gray-700 text-sm font-bold mb-2">
            העלה תמונות:
          </label>
          <input
            type="file"
            id="images"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-golden-brown-light file:text-golden-brown hover:file:bg-golden-brown-lighter"
            onChange={handleImageChange}
            multiple
            accept="image/*"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={image.name + index} className="relative w-24 h-24 border rounded overflow-hidden">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Selected image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index, false)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  aria-label="הסר תמונה"
                >
                  <FaTimesCircle />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* כפתורי שמירה ופרסום */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:shadow-outline flex items-center gap-2"
            disabled={loading}
          >
            <FaSave /> שמור טיוטה
          </button>
          <button
            type="submit"
            className="bg-golden-brown text-white font-bold py-2 px-4 rounded hover:bg-golden-brown-dark focus:outline-none focus:shadow-outline flex items-center gap-2"
            disabled={loading}
          >
            <FaPlusCircle /> {isEditingExistingPost ? 'עדכן פוסט' : (draftId ? 'פרסם טיוטה' : 'הוסף פוסט')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPostPage;
