// import React, { useState, useEffect, useContext } from 'react';
// import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// import axios from 'axios';
// import { AuthContext } from '../layouts/AuthLayout';
// import { FaPlusCircle, FaSave, FaTimesCircle, FaUpload } from 'react-icons/fa'; // ייבוא אייקונים
// import { v4 as uuidv4 } from 'uuid'; // לייצר ID ייחודי לתמונות זמניות
// import { useSelector, useDispatch } from 'react-redux'; // ✅ ייבוא Redux hooks
// import { fetchUserLocationsPaginated } from '../features/myLocations';
// import { 
//   fetchCategories, 
//   selectAllCategories, // נשתמש בזה כדי למצוא את הקטגוריה "אחר" לפי השם
//   selectLocationCategories, 
//   selectCategoriesLoading, 
//   selectCategoriesError 
// } from '../features/categories/categoriesSlice'; // ✅ ייבוא מ-categorySlice

// // קומפוננטת CustomAlertDialog (כמו ב-PlaceDetail)
// const CustomAlertDialog = ({ message, type, onConfirm, onCancel, showCancel = false }) => {
//   if (!message) return null;
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//       <div className="bg-white p-6 shadow-lg border border-gray-200 w-80 text-center rounded-md">
//         <p className={`text-lg font-semibold mb-4 ${type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
//           {message}
//         </p>
//         <div className="flex justify-center space-x-4">
//           <button
//             onClick={onConfirm}
//             className={`px-4 py-2 text-white rounded-md ${type === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
//           >
//             OK
//           </button>
//           {showCancel && (
//             <button
//               onClick={onCancel}
//               className="px-4 py-2 bg-gray-300 text-gray-800 hover:bg-gray-400 rounded-md"
//             >
//               Cancel
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };


// const AddLocationPage = () => {
//   const { userId, currentUser } = useContext(AuthContext); 
//   const navigate = useNavigate();
//   const { draftId: paramId } = useParams();
//   const [searchParams] = useSearchParams();
//   const itemTypeParam = searchParams.get('type');

//   const dispatch = useDispatch(); // ✅ אתחול useDispatch

//   // ✅ אחזור קטגוריות מ-Redux
//   const categories = useSelector(selectLocationCategories);
//   const allCategories = useSelector(selectAllCategories); // נצטרך את כל הקטגוריות למצוא את "אחר"
//   const categoriesLoading = useSelector(selectCategoriesLoading);
//   const categoriesError = useSelector(selectCategoriesError);

//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [city, setCity] = useState('');
//   const [area, setArea] = useState('');
//   const [country, setCountry] = useState('');
//   const [category, setCategory] = useState('');
//   const [customCategoryName, setCustomCategoryName] = useState('');
//   const [restaurantType, setRestaurantType] = useState('');
//   const [kosherAuthority, setKosherAuthority] = useState('');
//   const [kosherAuthorityOther, setKosherAuthorityOther] = useState('');
//   const [images, setImages] = useState([]);
//   const [existingImages, setExistingImages] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [alertDialog, setAlertDialog] = useState(null);

//   const [draftId, setDraftId] = useState(null);
//   const [isEditingExistingLocation, setIsEditingExistingLocation] = useState(false);

//   // ✅ טעינת קטגוריות כאשר הקומפוננטה נטענת
//   useEffect(() => {
//     dispatch(fetchCategories('location')); // טען קטגוריות מסוג 'location'
//   }, [dispatch]);

//   useEffect(() => {
//     const loadLocationOrDraft = async () => {
//       console.log("AddLocationPage useEffect triggered. paramId:", paramId, "itemTypeParam:", itemTypeParam);

//       if (paramId) {
//         setLoading(true);
//         setError(null);
//         setDraftId(null);

//         let dataLoaded = false;

//         if (itemTypeParam === 'location') {
//           try {
//             const locationResponse = await axios.get(`http://localhost:3001/api/locations/${paramId}`);
//             const locationData = locationResponse.data;
//             console.log("AddLocationPage: Loaded existing location data (via type hint):", locationData);
            
//             setName(locationData.name || '');
//             setDescription(locationData.description || '');
//             setCity(locationData.city || '');
//             setArea(locationData.area || '');
//             setCountry(locationData.country || '');
//             setCategory(locationData.category_id || '');
//             setCustomCategoryName(locationData.customCategoryName || '');
//             setRestaurantType(locationData.restaurantType || '');
//             setKosherAuthority(locationData.kosherAuthority || '');
//             setKosherAuthorityOther(locationData.kosherAuthorityOther || '');
//             setExistingImages(locationData.images || []);
//             setImages([]);
//             setIsEditingExistingLocation(true); 
//             dataLoaded = true;
//           } catch (err) {
//             console.error('AddLocationPage: Failed to load existing location with type hint:', err);
//             setAlertDialog({ type: 'error', message: 'נכשל בטעינת המיקום לעריכה.' });
//           }
//         } else if (itemTypeParam === 'draft') {
//           try {
//             const draftResponse = await axios.get(`http://localhost:3001/api/drafts/${paramId}`);
//             const draftData = draftResponse.data.data;
//             console.log("AddLocationPage: Loaded draft data (via type hint):", draftData);
            
//             setDraftId(paramId);
//             setName(draftData.name || '');
//             setDescription(draftData.description || '');
//             setCity(draftData.city || '');
//             setArea(draftData.area || '');
//             setCountry(draftData.country || '');
//             setCategory(draftData.category_id || '');
//             setCustomCategoryName(draftData.customCategoryName || '');
//             setRestaurantType(draftData.restaurantType || '');
//             setKosherAuthority(draftData.kosherAuthority || '');
//             setKosherAuthorityOther(draftData.kosherAuthorityOther || '');
//             setExistingImages(draftData.images || []);
//             setImages([]);
//             setIsEditingExistingLocation(false); 
//             dataLoaded = true;
//           } catch (err) {
//             console.error('AddLocationPage: Failed to load draft with type hint:', err);
//             setAlertDialog({ type: 'error', message: 'נכשל בטעינת הטיוטה לעריכה.' });
//           }
//         }

//         if (!dataLoaded) {
//             console.log("AddLocationPage: No specific type hint or previous load failed, attempting both location and draft as fallback.");
//             try {
//                 const locationResponse = await axios.get(`http://localhost:3001/api/locations/${paramId}`);
//                 const locationData = locationResponse.data;
//                 console.log("AddLocationPage: Loaded existing location data (fallback):", locationData);
                
//                 setName(locationData.name || '');
//                 setDescription(locationData.description || '');
//                 setCity(locationData.city || '');
//                 setArea(locationData.area || '');
//                 setCountry(locationData.country || '');
//                 setCategory(locationData.category_id || '');
//                 setCustomCategoryName(locationData.customCategoryName || '');
//                 setRestaurantType(locationData.restaurantType || '');
//                 setKosherAuthority(locationData.kosherAuthority || '');
//                 setKosherAuthorityOther(locationData.kosherAuthorityOther || '');
//                 setExistingImages(locationData.images || []);
//                 setImages([]);
//                 setIsEditingExistingLocation(true); 
//                 dataLoaded = true;
//             } catch (locationErr) {
//                 console.warn('AddLocationPage: Location not found (fallback), trying to load as draft:', locationErr);
//                 try {
//                     const draftResponse = await axios.get(`http://localhost:3001/api/drafts/${paramId}`);
//                     const draftData = draftResponse.data.data;
//                     console.log("AddLocationPage: Loaded draft data (fallback):", draftData);
                    
//                     setDraftId(paramId);
//                     setName(draftData.name || '');
//                     setDescription(draftData.description || '');
//                     setCity(draftData.city || '');
//                     setArea(draftData.area || '');
//                     setCountry(draftData.country || '');
//                     setCategory(draftData.category_id || '');
//                     setCustomCategoryName(draftData.customCategoryName || '');
//                     setRestaurantType(draftData.restaurantType || '');
//                     setKosherAuthority(draftData.kosherAuthority || '');
//                     setKosherAuthorityOther(draftData.kosherAuthorityOther || '');
//                     setExistingImages(draftData.images || []);
//                     setImages([]);
//                     setIsEditingExistingLocation(false); 
//                     dataLoaded = true;
//                 } catch (draftErr) {
//                     console.error('AddLocationPage: Failed to load location or draft (final fallback failure):', draftErr);
//                     setAlertDialog({ type: 'error', message: 'נכשל בטעינת המקום/טיוטה לעריכה.' });
//                 }
//             }
//         }
//         setLoading(false);
//       } else {
//         setName('');
//         setDescription('');
//         setCity('');
//         setArea('');
//         setCountry('');
//         setCategory('');
//         setCustomCategoryName('');
//         setRestaurantType('');
//         setKosherAuthority('');
//         setKosherAuthorityOther('');
//         setImages([]);
//         setExistingImages([]);
//         setDraftId(null);
//         setIsEditingExistingLocation(false);
//         setLoading(false);
//       }
//     };
//     loadLocationOrDraft();
//   }, [paramId, itemTypeParam]);

//   // הגדרות אלו צריכות להופיע רק פעם אחת בתוך הקומפוננטה
//   const restaurantTypes = [
//     { id: 'meat', name: 'בשרי' },
//     { id: 'dairy', name: 'חלבי' },
//     { id: 'parve', name: 'פרווה' },
//   ];

//   const kosherAuthorities = [
//     { id: 'rabbinate', name: 'רבנות מקומית' },
//     { id: 'mehadrin', name: 'מהדרין' },
//     { id: 'badatz', name: 'בד"ץ' },
//     { id: 'other', name: 'אחר (פרט)' },
//   ];

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     setImages((prevImages) => [...prevImages, ...files]);
//   };

//   const handleRemoveImage = (indexToRemove, isExisting = false) => {
//     if (isExisting) {
//       setExistingImages((prev) => prev.filter((_, index) => index !== indexToRemove));
//     } else {
//       setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
//     }
//   };

//   const validateForm = () => {
//     if (!name.trim()) {
//       setError('שם המקום הוא שדה חובה.');
//       return false;
//     }
//     if (!category) {
//       setError('יש לבחור קטגוריה.');
//       return false;
//     }
//     // ✅ מצא את ה-ID של קטגוריית "אחר" באופן דינמי
//     const otherCategory = allCategories.find(cat => cat.name === 'אחר' && cat.type === 'location');
//     if (otherCategory && category === otherCategory.id && !customCategoryName.trim()) { 
//       setError('יש להזין שם לקטגוריה מותאמת אישית.');
//       return false;
//     }
//     if (restaurantType && !kosherAuthority) {
//       setError('יש לבחור רשות כשרות אם נבחר סוג מסעדה.');
//       return false;
//     }
//     if (kosherAuthority === 'other' && !kosherAuthorityOther.trim()) {
//       setError('יש לפרט את רשות הכשרות האחרת.');
//       return false;
//     }
//     setError(null);
//     return true;
//   };

//   const handleSubmit = async (e, isDraft = false) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccessMessage(null);

//     if (!isDraft && !validateForm()) {
//       setLoading(false);
//       return;
//     }

//     if (!userId) {
//       setAlertDialog({ type: 'error', message: 'User not logged in. Please log in to add a place.' });
//       setLoading(false);
//       return;
//     }

//     const formData = new FormData();
//     formData.append('name', name);
//     formData.append('description', description);
//     formData.append('city', city);
//     formData.append('area', area);
//     formData.append('country', country);
//     formData.append('category_id', category);

//     if (customCategoryName) formData.append('customCategoryName', customCategoryName);
//     if (restaurantType) formData.append('restaurantType', restaurantType);
//     if (kosherAuthority) formData.append('kosherAuthority', kosherAuthority);
//     if (kosherAuthorityOther) formData.append('kosherAuthorityOther', kosherAuthorityOther);
    
//     // הוסף תמונות קיימות (שמות קבצים)
//     if (existingImages.length > 0) {
//       formData.append('existing_images', JSON.stringify(existingImages));
//     }

//     // הוסף קבצי תמונה חדשים
//     images.forEach((image) => {
//       formData.append('images', image);
//     });

//     try {
//       if (isDraft) {
//         let finalImagesForDraft = [...existingImages]; 

//         // 1. Upload new images if any are selected
//         if (images.length > 0) {
//             const imageUploadFormData = new FormData();
//             images.forEach(image => {
//                 imageUploadFormData.append('images', image);
//             });
//             try {
//                 const uploadRes = await axios.post('http://localhost:3001/api/upload-temp-images', imageUploadFormData, {
//                     headers: {
//                         'Content-Type': 'multipart/form-data',
//                     },
//                 });
//                 const uploadedFilenames = uploadRes.data.filenames;
//                 finalImagesForDraft = [...finalImagesForDraft, ...uploadedFilenames];
//                 setImages([]);
//                 setExistingImages(finalImagesForDraft);
//             } catch (uploadErr) {
//                 console.error('AddLocationPage: Failed to upload new images for draft:', uploadErr);
//                 setAlertDialog({ type: 'error', message: 'נכשל בהעלאת תמונות לטיוטה.' });
//                 setLoading(false);
//                 return;
//             }
//         }

//         const draftPayload = {
//           draftId: draftId || paramId,
//           type: 'location',
//           data: {
//             name, description, city, area, country, category_id: category, user_id: userId, 
//             customCategoryName, restaurantType, kosherAuthority, kosherAuthorityOther,
//             images: finalImagesForDraft
//           }
//         };
//         const res = await axios.post('http://localhost:3001/api/drafts', draftPayload);
//         setDraftId(res.data.id);
//         setAlertDialog({ type: 'success', message: 'הטיוטה נשמרה בהצלחה!' });
//       } else if (isEditingExistingLocation) {
//         formData.append('user_id', userId); 
//         if (currentUser && currentUser.role) { 
//           formData.append('role', currentUser.role);
//         }
        
//         console.log("AddLocationPage: Attempting PUT request to update location.");
//         console.log("AddLocationPage: paramId (location ID to update):", paramId);
//         console.log("AddLocationPage: userId (from AuthContext, sending in formData):", userId);
//         console.log("AddLocationPage: currentUser.role (sending in formData):", currentUser?.role);
//         console.log("AddLocationPage: isEditingExistingLocation state:", isEditingExistingLocation);
//         console.log("AddLocationPage: FormData content (manual inspection might be needed for files):");
//         for (let pair of formData.entries()) {
//             console.log(pair[0]+ ', ' + pair[1]); 
//         }

//         const res = await axios.put(`http://localhost:3001/api/locations/${paramId}`, formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });
//         setSuccessMessage('המקום עודכן בהצלחה!');
//         setAlertDialog({ type: 'success', message: 'המקום עודכן בהצלחה!' });
//         // Refresh my locations after update
//         dispatch(fetchUserLocationsPaginated({ userId, page: 1, limit: 6 }));
//         navigate('/my-locations');
//       } else {
//         formData.append('user_id', userId); 
//         const res = await axios.post('http://localhost:3001/api/locations', formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });
//         setSuccessMessage('המקום נוסף בהצלחה!');
//         setAlertDialog({ type: 'success', message: 'המקום נוסף בהצלחה!' });
//         if (draftId) {
//           await axios.delete(`http://localhost:3001/api/drafts/${draftId}`);
//           console.log('Draft deleted after publishing.');
//         }
//         // Refresh my locations after add
//         dispatch(fetchUserLocationsPaginated({ userId, page: 1, limit: 6 }));
//         navigate('/my-locations');
//       }
//     } catch (err) {
//       console.error('AddLocationPage: Error submitting form:', err);
//       const errorMessage = err.response?.data?.error || `שגיאה בשמירת המקום: ${err.message || ''}`;
//       setAlertDialog({ type: 'error', message: errorMessage });
//     } finally {
//       setLoading(false);
//       setTimeout(() => setAlertDialog(null), 3000);
//     }
//   };

//   if (loading || categoriesLoading === 'pending') { // ✅ הוספת מצב טעינה לקטגוריות
//     return (
//       <div className="text-center w-full py-16">
//         <h2 className="text-2xl font-bold mb-4 text-dark-gray-text">טוען...</h2>
//         <p className="text-gray-text mb-6">אנא המתן...</p>
//       </div>
//     );
//   }

//   if (categoriesError) { // ✅ טיפול בשגיאת טעינת קטגוריות
//     return (
//       <div className="text-center w-full py-16">
//         <h2 className="text-2xl font-bold mb-4 text-red-600">שגיאה בטעינת קטגוריות</h2>
//         <p className="text-red-500 mb-6">{categoriesError}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-4xl mx-auto py-8 px-4 font-inter pt-16">
//       <CustomAlertDialog
//         message={alertDialog?.message}
//         type={alertDialog?.type}
//         onConfirm={() => setAlertDialog(null)}
//         showCancel={false}
//       />

//       <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
//         {isEditingExistingLocation ? 'ערוך מקום' : (draftId ? 'ערוך טיוטה (מקום)' : 'הוסף מקום חדש')}
//       </h2>

//       <form onSubmit={(e) => handleSubmit(e, false)} className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

//         {/* שם המקום */}
//         <div className="mb-4">
//           <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
//             שם המקום: <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             id="name"
//             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//           />
//         </div>

//         {/* תיאור */}
//         <div className="mb-4">
//           <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
//             תיאור:
//           </label>
//           <textarea
//             id="description"
//             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             rows="4"
//           ></textarea>
//         </div>

//         {/* קטגוריה */}
//         <div className="mb-4">
//           <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
//             קטגוריה: <span className="text-red-500">*</span>
//           </label>
//           <select
//             id="category"
//             className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             required
//           >
//             <option value="">בחר קטגוריה</option>
//             {categories.map((cat) => (
//               <option key={cat.id} value={cat.id}>{cat.name}</option>
//             ))}
//           </select>
//           {/* ✅ שינוי התנאי ל"אחר" בהתבסס על ה-ID הדינמי */}
//           {allCategories.find(cat => cat.id === category && cat.name === 'אחר') && ( 
//             <div className="mt-2">
//               <label htmlFor="customCategoryName" className="block text-gray-700 text-sm font-bold mb-2">
//                 שם קטגוריה מותאמת אישית: <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 id="customCategoryName"
//                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
//                 value={customCategoryName}
//                 onChange={(e) => setCustomCategoryName(e.target.value)}
//                 placeholder="לדוגמה: 'בית כנסת'"
//                 required
//               />
//             </div>
//           )}
//         </div>

//         {/* סוג מסעדה (אם רלוונטי) */}
//         <div className="mb-4">
//           <label htmlFor="restaurantType" className="block text-gray-700 text-sm font-bold mb-2">
//             סוג מסעדה:
//           </label>
//           <select
//             id="restaurantType"
//             className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
//             value={restaurantType}
//             onChange={(e) => setRestaurantType(e.target.value)}
//           >
//             <option value="">בחר סוג</option>
//             {restaurantTypes.map((type) => (
//               <option key={type.id} value={type.id}>{type.name}</option>
//             ))}
//           </select>
//         </div>

//         {/* כשרות (אם רלוונטי) */}
//         {restaurantType && (
//           <div className="mb-4">
//             <label htmlFor="kosherAuthority" className="block text-gray-700 text-sm font-bold mb-2">
//               רשות כשרות: <span className="text-red-500">*</span>
//             </label>
//             <select
//               id="kosherAuthority"
//               className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
//               value={kosherAuthority}
//               onChange={(e) => setKosherAuthority(e.target.value)}
//               required
//             >
//               <option value="">בחר רשות כשרות</option>
//               {kosherAuthorities.map((auth) => (
//                 <option key={auth.id} value={auth.id}>{auth.name}</option>
//               ))}
//             </select>
//             {kosherAuthority === 'other' && (
//               <div className="mt-2">
//                 <label htmlFor="kosherAuthorityOther" className="block text-gray-700 text-sm font-bold mb-2">
//                   פרט רשות כשרות אחרת: <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="kosherAuthorityOther"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
//                   value={kosherAuthorityOther}
//                   onChange={(e) => setKosherAuthorityOther(e.target.value)}
//                   required
//                 />
//               </div>
//             )}
//           </div>
//         )}

//         {/* תמונות קיימות (לטיוטות) */}
//         {existingImages.length > 0 && (
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               תמונות קיימות:
//             </label>
//             <div className="flex flex-wrap gap-2">
//               {existingImages.map((imageName, index) => (
//                 <div key={imageName || index} className="relative w-24 h-24 border rounded overflow-hidden">
//                   <img
//                     src={`http://localhost:3001/uploads/${imageName}`} 
//                     alt={`Existing image ${index + 1}`}
//                     className="w-full h-full object-cover"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveImage(index, true)}
//                     className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
//                     aria-label="הסר תמונה קיימת"
//                   >
//                     <FaTimesCircle />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* העלאת תמונות חדשות */}
//         <div className="mb-6">
//           <label htmlFor="images" className="block text-gray-700 text-sm font-bold mb-2">
//             העלה תמונות:
//           </label>
//           <input
//             type="file"
//             id="images"
//             className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-golden-brown-light file:text-golden-brown hover:file:bg-golden-brown-lighter"
//             onChange={handleImageChange}
//             multiple
//             accept="image/*"
//           />
//           <div className="mt-2 flex flex-wrap gap-2">
//             {images.map((image, index) => (
//               <div key={image.name + index} className="relative w-24 h-24 border rounded overflow-hidden">
//                 <img
//                   src={URL.createObjectURL(image)}
//                   alt={`Selected image ${index + 1}`}
//                   className="w-full h-full object-cover"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => handleRemoveImage(index, false)}
//                   className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
//                   aria-label="הסר תמונה"
//                 >
//                   <FaTimesCircle />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
        

//         {/* כפתורי שמירה ופרסום */}
//         <div className="flex justify-end gap-4">
//           <button
//             type="button"
//             onClick={(e) => handleSubmit(e, true)}
//             className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:shadow-outline flex items-center gap-2"
//             disabled={loading}
//           >
//             <FaSave /> שמור טיוטה
//           </button>
//           <button
//             type="submit"
//             className="bg-golden-brown text-white font-bold py-2 px-4 rounded hover:bg-golden-brown-dark focus:outline-none focus:shadow-outline flex items-center gap-2"
//             disabled={loading}
//           >
//             <FaPlusCircle /> {isEditingExistingLocation ? 'עדכן מקום' : (draftId ? 'פרסם טיוטה' : 'הוסף מקום')}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddLocationPage;
// את לבדוק למה הז כלכך קצת שורות 
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../layouts/AuthLayout';
import { FaPlusCircle, FaSave, FaTimesCircle, FaUpload } from 'react-icons/fa'; // ייבוא אייקונים
import { v4 as uuidv4 } from 'uuid'; // לייצר ID ייחודי לתמונות זמניות
import { useSelector, useDispatch } from 'react-redux'; // ✅ ייבוא Redux hooks
import { 
  fetchCategories, 
  selectAllCategories, 
  selectLocationCategories, 
  selectCategoriesLoading, 
  selectCategoriesError 
} from '../features/categories/categoriesSlice'; // ✅ ייבוא מ-categorySlice
import { fetchLocationById, addLocation, updateLocation, uploadTempImages } from '../api/locationsApi';



import {
  getDraftById,
  saveDraft,
  deleteDraft
} from "../api/draftsApi";


// ✅ ייבוא קומפוננטת הטופס החדשה/מעודכנת
import AddLocationForm from '../features/locations/AddLocationForm'; 

// קומפוננטת CustomAlertDialog (כמו ב-PlaceDetail)
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


const AddLocationPage = () => {
  const { userId, currentUser } = useContext(AuthContext); 
  const navigate = useNavigate();
  const { draftId: paramId } = useParams(); // יכול להיות ID של מקום קיים או ID של טיוטה
  const [searchParams] = useSearchParams();
  const itemTypeParam = searchParams.get('type'); // 'location' או 'draft'

  const dispatch = useDispatch();

  const categories = useSelector(selectLocationCategories);
  const allCategories = useSelector(selectAllCategories); 
  const categoriesLoading = useSelector(selectCategoriesLoading);
  const categoriesError = useSelector(selectCategoriesError);

  const [initialFormData, setInitialFormData] = useState(null); // נתונים ראשוניים לטופס
  const [loading, setLoading] = useState(true); // מצב טעינה כללי
  const [error, setError] = useState(null); // שגיאות כלליות
  const [alertDialog, setAlertDialog] = useState(null); // לניהול אלרטים

  const [isEditingExistingLocation, setIsEditingExistingLocation] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(null); // ID של הטיוטה הנוכחית אם קיימת

  useEffect(() => {
    dispatch(fetchCategories('location')); 
  }, [dispatch]);

  useEffect(() => {
    const loadLocationOrDraft = async () => {
      setLoading(true);
      setError(null);
      setInitialFormData(null);
      setIsEditingExistingLocation(false);
      setCurrentDraftId(null);

      if (paramId) {
        let dataLoaded = false;
        let fetchedData = null;

        // נסה לטעון כמקום קיים
        if (itemTypeParam === 'location' || !itemTypeParam) { // אם סוג לא צוין, נסה קודם כמקום
          try {
            // const locationResponse = await axios.get(`http://localhost:3001/api/locations/${paramId}`);
const locationResponse = await fetchLocationById(paramId);
            fetchedData = locationResponse.data;
            setIsEditingExistingLocation(true);
            dataLoaded = true;
            console.log("AddLocationPage: Loaded existing location:", fetchedData);
          } catch (err) {
            console.warn('AddLocationPage: Location not found or error, trying as draft:', err);
          }
        }

        // אם לא נטען כמקום, או שצוין במפורש 'draft'
        if (!dataLoaded && (itemTypeParam === 'draft' || !itemTypeParam)) {
          try {
            // const draftResponse = await axios.get(`http://localhost:3001/api/drafts/${paramId}`);
            const draftResponse = await getDraftById(paramId);

            fetchedData = draftResponse.data.data; // נתוני הטיוטה נמצאים בתוך draft.data
            setCurrentDraftId(paramId);
            dataLoaded = true;
            console.log("AddLocationPage: Loaded draft:", fetchedData);
          } catch (err) {
            console.warn('AddLocationPage: Draft not found or error:', err);
          }
        }

        if (dataLoaded && fetchedData) {
          // נתוני טופס ל-react-hook-form
          const transformedData = {
            name: fetchedData.name || '',
            description: fetchedData.description || '',
            location: fetchedData.address || fetchedData.city || '', // ייתכן שנצטרך לשלב כתובת/עיר
            city: fetchedData.city || '',
            area: fetchedData.area || '',
            country: fetchedData.country || '',
            category_id: fetchedData.category_id || '',
            customCategoryName: fetchedData.customCategoryName || '',
            restaurantType: fetchedData.restaurantType || '',
            kosherAuthority: fetchedData.kosherAuthority || '',
            kosherAuthorityOther: fetchedData.kosherAuthorityOther || '',
            images: [], // תמונות חדשות שיועלו
            existingImages: fetchedData.images || [], // תמונות קיימות מהשרת
            lat: fetchedData.lat || '',
            lng: fetchedData.lng || '',
          };
          setInitialFormData(transformedData);
        } else {
          setError('המקום או הטיוטה לא נמצאו.');
        }
      } else {
        // מצב הוספה חדשה - איפוס נתונים
        setInitialFormData({
            name: '', description: '', location: '', city: '', area: '', country: '',
            category_id: '', customCategoryName: '', restaurantType: '', kosherAuthority: '',
            kosherAuthorityOther: '', images: [], existingImages: [], lat: '', lng: ''
        });
      }
      setLoading(false);
    };
    loadLocationOrDraft();
  }, [paramId, itemTypeParam, allCategories]); // הוספתי allCategories כתלות כדי לוודא זמינות קטגוריות

  // פונקציית השליחה שתועבר ל-AddLocationForm
  const handleFormSubmit = async (data, isDraft = false) => {
    console.log('Sending location data:', data);
    console.log('Is draft:', isDraft);
    setLoading(true);
    setError(null);
    setAlertDialog(null);

    if (!userId) {
      setAlertDialog({ type: 'error', message: 'User not logged in. Please log in to add a place.' });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('city', data.city);
    formData.append('area', data.area);
    formData.append('country', data.country);
    formData.append('category_id', data.category_id);
    formData.append('lat', data.lat);
    formData.append('lng', data.lng);

    if (data.customCategoryName) formData.append('customCategoryName', data.customCategoryName);
    if (data.restaurantType) formData.append('restaurantType', data.restaurantType);
    if (data.kosherAuthority) formData.append('kosherAuthority', data.kosherAuthority);
    if (data.kosherAuthorityOther) formData.append('kosherAuthorityOther', data.kosherAuthorityOther);
    
    // הוסף תמונות קיימות (שמות קבצים)
    if (data.existingImages && data.existingImages.length > 0) {
      formData.append('existing_images', JSON.stringify(data.existingImages));
    }

    // הוסף קבצי תמונה חדשים
    data.images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      if (isDraft) {
        // עבור טיוטה, אנחנו צריכים להעלות תמונות חדשות בנפרד
        let finalImagesForDraft = [...(data.existingImages || [])]; 

        if (data.images.length > 0) {
            const imageUploadFormData = new FormData();
            data.images.forEach(image => {
                imageUploadFormData.append('images', image);
            });
            try {
                // const uploadRes = await axios.post('http://localhost:3001/api/upload-temp-images', imageUploadFormData, {
                //     headers: { 'Content-Type': 'multipart/form-data' },
                // });
                const uploadRes = await uploadTempImages(imageUploadFormData);
                const uploadedFilenames = uploadRes.data.filenames;
                finalImagesForDraft = [...finalImagesForDraft, ...uploadedFilenames];
            } catch (uploadErr) {
                console.error('AddLocationPage: Failed to upload new images for draft:', uploadErr);
                setAlertDialog({ type: 'error', message: 'נכשל בהעלאת תמונות לטיוטה.' });
                setLoading(false);
                return;
            }
        }

        const draftPayload = {
          draftId: currentDraftId || paramId, // השתמש ב-currentDraftId אם קיים, אחרת ב-paramId
          type: 'location',
          data: {
            ...data, // כל נתוני הטופס
            user_id: userId, 
            images: finalImagesForDraft // רק שמות הקבצים של התמונות
          }
        };
        // const res = await axios.post('http://localhost:3001//drafts', draftPayload);
        const res = await saveDraft(draftPayload);
        setCurrentDraftId(res.data.id); // עדכן את ID הטיוטה אם נשמרה חדשה
        setAlertDialog({ type: 'success', message: 'הטיוטה נשמרה בהצלחה!' });
      } else if (isEditingExistingLocation) {
        formData.append('user_id', userId); 
        if (currentUser && currentUser.role) { 
          formData.append('role', currentUser.role);
        }
        
        // const res = await axios.put(`http://localhost:3001/api/locations/${paramId}`, formData, {
        //   headers: { 'Content-Type': 'multipart/form-data' },
        // });
const res = await updateLocation({ id: paramId, locationData: formData });

        setAlertDialog({ type: 'success', message: 'המקום עודכן בהצלחה!' });
        navigate('/my-locations');
      } else {
        formData.append('user_id', userId); 
        // const res = await axios.post('http://localhost:3001/api/locations', formData, {
        //   headers: { 'Content-Type': 'multipart/form-data' },
        // });
const locationData = {
  name: data.name,
  description: data.description,
  category_id: data.category_id,
  lat: data.lat,
  lng: data.lng,
  city: data.city,
  area: data.area,
  country: data.country,
  restaurantType: data.restaurantType,
  kosherAuthority: data.kosherAuthority,
  kosherAuthorityOther: data.kosherAuthorityOther,
  customCategoryName: data.customCategoryName,
  images: data.images, // אם יש
  existing_images: data.existingImages, // אם יש
  user_id: userId
};

const res = await addLocation(locationData);

        setAlertDialog({ type: 'success', message: 'המקום נוסף בהצלחה!' });
        if (currentDraftId) { // אם פורסם מטיוטה, מחק את הטיוטה
          // await axios.delete(`http://localhost:3001/api/drafts/${currentDraftId}`);
          await deleteDraft(currentDraftId);
          console.log('Draft deleted after publishing.');
        }
        navigate('/my-locations');
      }
    } catch (err) {
      console.error('AddLocationPage: Error submitting form:', err);
      const errorMessage = err.response?.data?.error || `שגיאה בשמירת המקום: ${err.message || ''}`;
      setAlertDialog({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
      setTimeout(() => setAlertDialog(null), 3000);
    }
  };

  if (loading || categoriesLoading === 'pending' || !initialFormData) { 
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-dark-gray-text">טוען...</h2>
        <p className="text-gray-text mb-6">אנא המתן...</p>
      </div>
    );
  }

  if (error || categoriesError) { 
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-red-600">שגיאה בטעינה</h2>
        <p className="text-red-500 mb-6">{error || categoriesError}</p>
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
        {isEditingExistingLocation ? 'ערוך מקום' : (currentDraftId ? 'ערוך טיוטה (מקום)' : 'הוסף מקום חדש')}
      </h2>

      {/* ✅ העברת הנתונים והפונקציות לקומפוננטת הטופס */}
      <AddLocationForm
        categories={categories}
        allCategories={allCategories} // העבר גם את כל הקטגוריות למקרה של "אחר"
        onSubmit={handleFormSubmit}
        user_id={userId}
        initialData={initialFormData} // העברת הנתונים הראשוניים
        isEditingExistingLocation={isEditingExistingLocation}
        isDraftMode={!!currentDraftId} // האם אנחנו במצב עריכת טיוטה
      />
    </div>
  );
};

export default AddLocationPage;







