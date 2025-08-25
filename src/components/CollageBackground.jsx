// src/components/CollageBackground.jsx
import React from 'react';

import collageImage from '../assets/blurred_collage.png';

const CollageBackground = () => {
  /*
   * Thought Process for CollageBackground Component:
   *
   * 1. **Purpose:** Create a visually appealing, blurred background for the application.
   *
   * 2. **Image Source:** Use a specific image (`blurred_collage.png`) as the background.
   *
   * 3. **Placement:** The background needs to cover the entire viewport.
   *
   * 4. **Styling:** Apply styles to ensure the image covers, is centered, and most importantly, is blurred
   * to serve as an abstract background rather than a distracting foreground element.
   *
   * 5. **Reusability:** Keep it a simple, self-contained component for easy integration wherever a background is needed.
   */

  return (
    <div
      className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-xl"
      style={{ backgroundImage: `url(${collageImage})` }}
    ></div>
  );
};

export default CollageBackground;