// src/components/AccordionItem.jsx

import React, { useState } from 'react';
// ודא שזה הייבוא הנכון, ייתכן שצריך רק את ReactMarkdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ... שאר הקוד של הקומפוננטה

const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border rounded-md shadow-sm">
      <button
        className="flex items-center justify-between w-full py-3 px-4 text-left font-semibold"
        onClick={toggleAccordion}
      >
        {/* שיניתי את הקלאס text-golden-brown (או text-turquoise אם שינית בעבר) ל-text-black */}
        <h3 className="text-xl text-black">{question}</h3> 
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="prose max-w-none px-4 pb-4 text-gray-text" dir="ltr">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default AccordionItem;