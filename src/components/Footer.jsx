// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // *** לייבא את Link ***

import facebookIcon from '../assets/facebook.png';
import twitterIcon from '../assets/twitter.png';
import instagramIcon from '../assets/instagram.png';
import linkedinIcon from '../assets/linkedin.png';

const Footer = () => {
  return (
    <footer className="w-full bg-light-beige flex flex-col justify-center items-center z-10 mt-auto">
      <div className="w-full h-0.5 bg-golden-brown"></div>

      {/* סעיף חדש לקישורי מידע */}
      <div className="flex flex-wrap justify-center py-3 text-sm text-gray-text space-x-4 space-x-reverse" dir="rtl">
        <Link to="/help" className="hover:underline px-2 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-golden-brown">
          עזרה ושאלות נפוצות
        </Link>
        <Link to="/about" className="hover:underline px-2 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-golden-brown">
          אודותינו
        </Link>
        <Link to="/contact" className="hover:underline px-2 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-golden-brown">
          צור קשר
        </Link>
      </div>

      {/* סעיף אייקוני הסושיאל הקיים */}
      <div className="flex space-x-4 py-4">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <img src={facebookIcon} alt="Facebook" className="h-5 w-5" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <img src={twitterIcon} alt="Twitter" className="h-5 w-5" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <img src={instagramIcon} alt="Instagram" className="h-5 w-5" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          <img src={linkedinIcon} alt="LinkedIn" className="h-5 w-5" />
        </a>
      </div>

      {/* שורה של זכויות יוצרים */}
      <div className="w-full text-center text-xs text-gray-text py-2">
        <p>&copy; {new Date().getFullYear()} פלטפורמת שלום. כל הזכויות שמורות.</p>
      </div>
    </footer>
  );
};

export default Footer;