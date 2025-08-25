
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center text-center p-6 bg-cyan-100"
    >
      <h1 className="text-9xl font-bold text-cyan-700 mb-4">404</h1>
      <h2 className="text-4xl font-semibold text-cyan-700 mb-4">Page Not Found</h2>
      <p className="mb-8 text-cyan-700 max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={handleBackHome}
        className="bg-cyan-800 text-white px-6 py-3 rounded-md hover:bg-cyan-900 transition"
      >
        Back to Home
      </button>
    </div>
  );
};

export default PageNotFound;
