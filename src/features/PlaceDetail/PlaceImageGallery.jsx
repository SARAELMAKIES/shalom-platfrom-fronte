import React, { useState } from 'react';

// קומפוננטת גלריית תמונות עבור פרטי מקום
// ✅ נוסף getImageSrc כ-prop
const PlaceImageGallery = ({ images, placeName, onImageClick, getImageSrc }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // טיפול בניווט לתמונה הבאה
  const handleNextImage = () => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % images.length
      );
    }
  };

  // טיפול בניווט לתמונה הקודמת
  const handlePrevImage = () => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex - 1 + images.length) % images.length
      );
    }
  };

  return (
    // ✅ שינוי הגדרות גובה ורוחב ל-w-full h-full כדי למלא את ההורה
    // ✅ הסרת p-4 כדי לצמצם את המסגרת הלבנה
    <div className="w-full h-full bg-white flex items-center justify-center relative">
      {images && images.length > 0 ? (
        <>
          <img
            // ✅ שימוש בפונקציית getImageSrc עבור התמונה הראשית
            src={getImageSrc(images[currentImageIndex])}
            alt={`${placeName} image ${currentImageIndex + 1}`}
            // ✅ שינוי הגדרות גובה ורוחב לתמונה כדי למלא את המיכל
            className="object-contain w-full h-full cursor-zoom-in"
            // ✅ שימוש בפונקציית getImageSrc גם עבור מודאל התמונה
            onClick={() => onImageClick(getImageSrc(images[currentImageIndex]))}
          />
          {images.length > 1 && ( // הצג כפתורי ניווט ומונה רק אם יש יותר מתמונה אחת
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 text-xl cursor-pointer"
              >
                &#10094;
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 text-xl cursor-pointer"
              >
                &#10095;
              </button>
              {/* מונה תמונות כעיגולים קטנים */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {images.map((img, idx) => ( // ✅ שימוש בפונקציית getImageSrc עבור התמונות הקטנות
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-gray-400'}`}
                    aria-label={`Image ${idx + 1}`}
                    onClick={() => setCurrentImageIndex(idx)} // מאפשר לחיצה על העיגולים לשינוי תמונה
                    style={{ cursor: 'pointer' }} // הוספת סמן עכבר
                  ></span>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        // תמונת פלייס הולדר אם אין תמונות
        // ✅ שינוי הגדרות גובה ורוחב לתמונה כדי למלא את המיכל
        <img src={'https://placehold.co/600x400/cccccc/000000?text=No+Image'} alt="אין תמונה זמינה" className="object-cover w-full h-full" />
      )}
    </div>
  );
};

export default PlaceImageGallery;
