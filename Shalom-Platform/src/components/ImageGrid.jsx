

import React from 'react';

const ImageGrid = ({ images, onImageClick }) => {
  
  if (!images || images.length === 0) {
    return (
      <div className="w-full text-center text-gray-500 py-4">
        אין תמונות זמינות למקום זה.
      </div>
    );
  }

  
  const getGridItemClasses = (index, numImages) => {
    
    if (numImages === 1) return "col-span-full row-span-1 aspect-video"; 
    if (numImages === 2) return "col-span-1 row-span-1 aspect-video";
    if (numImages === 3) { 
      if (index === 0) return "col-span-2 row-span-2 aspect-[3/2] md:aspect-video"; 
      return "col-span-1 row-span-1 aspect-square md:aspect-video";
    }
    if (numImages === 4) { 
      if (index === 0) return "col-span-full aspect-video";
      return "col-span-1 aspect-square";
    }
    if (numImages === 5) {
      if (index === 0 || index === 1) return "col-span-1 aspect-video";
      return "col-span-1 aspect-square";
    }
    if (numImages === 6) {
        return "col-span-1 aspect-square";
    }
    
    switch (index % 10) {
      case 0: return "col-span-2 row-span-2 aspect-[3/2]"; 
      case 1: return "col-span-1 aspect-square";
      case 2: return "col-span-1 aspect-video";
      case 3: return "col-span-2 aspect-[4/3]";
      case 4: return "col-span-1 aspect-square";
      case 5: return "col-span-1 aspect-video";
      case 6: return "col-span-2 row-span-1 aspect-[16/9]"; 
      case 7: return "col-span-1 aspect-square";
      case 8: return "col-span-1 aspect-video";
      case 9: return "col-span-2 aspect-[3/4]"; 
      default: return "col-span-1 aspect-square"; 
    }
  };


  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 auto-rows-min">
      {/* לולאה על מערך התמונות והצגת כל תמונה כפריט ברשת */}
      {images.map((image, index) => (
        <div 
          key={index} 
          className={`relative w-full overflow-hidden rounded-lg shadow-md cursor-pointer group cursor-zoom-in ${getGridItemClasses(index, images.length)}`}
         
          onClick={() => onImageClick(image)} 
        >
          <img
            src={image}
            alt={`תמונה מגלריה ${index + 1}`} 
         
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
           
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x200?text=שגיאת טעינה"; }} 
          />
      
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex justify-center items-center">
            <span className="text-white opacity-0 group-hover:opacity-100 text-lg font-semibold">
              הצג
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
