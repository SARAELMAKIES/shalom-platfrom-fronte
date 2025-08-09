// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';



const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Shalom Platform!</h1>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl">
        This is a temporary home page. Feel free to explore or sign in/sign up.
      </p>
      <div className="flex space-x-4">
        <Link 
          to="/signin" 
          className="bg-blue-600 text-white py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition duration-300"
        >
          Sign In
        </Link>
        <Link 
          to="/signup" 
          className="bg-green-600 text-white py-3 px-6 rounded-lg text-lg hover:bg-green-700 transition duration-300"
        >
          Sign Up
        </Link>
      </div>
      <p className="mt-8 text-gray-500 text-sm">
        (Note: The Sign In/Sign Up buttons in the header will change based on your login status.)
      </p>
    </div>
  );
};

export default HomePage;





