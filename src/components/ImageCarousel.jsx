
import React, { useState } from 'react';

const ImageCarousel = ({ images, onImageClick }) => {
  
  const [currentIndex, setCurrentIndex] = useState(0);


  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

 
  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  
  if (!images || images.length === 0) {
    return (
      <div className="w-full max-w-xs mx-auto text-center text-gray-500 py-4"> {/* Adjusted max-w-sm to max-w-xs for smaller image */}
        No images are available for this location.
      </div>
    );
  }

  return (
  
    <div className="relative w-full max-w-xs mx-auto mb-6"> {/* Adjusted max-w-lg to max-w-xs for smaller image */}
   
      <div 
        className="relative w-full h-auto overflow-hidden shadow-md cursor-pointer group" 
        onClick={() => onImageClick(images[currentIndex])} 
        style={{
         
          WebkitBoxReflect: 'below 2px linear-gradient(to bottom, rgba(0,0,0,0.02), rgba(0,0,0,0.1))', 
       
        }}
      >
        <img
          src={images[currentIndex]}
          alt={`תמונה ${currentIndex + 1} מתוך ${images.length}`}
         
          className="w-full h-auto object-cover aspect-video transform transition-transform duration-300 group-hover:scale-105" 
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400?text=שגיאת טעינה"; }} // Fallback image on error
        />
      </div>

     
      {images.length > 1 && (
        <>
       
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-4 text-white text-4xl leading-none font-thin opacity-70 hover:opacity-100 transition-opacity duration-200 focus:outline-none"
            aria-label="תמונה קודמת"
          >
            &#10094; 
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-white text-4xl leading-none font-thin opacity-70 hover:opacity-100 transition-opacity duration-200 focus:outline-none"
            aria-label="תמונה הבאה"
          >
            &#10095;
          </button>
       
          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-gray-400'
                } hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-white`}
                aria-label={`עבור לתמונה ${index + 1}`}
              ></button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
