import React from 'react';
// No need to import ReactMarkdown and remarkGfm here as they are in AccordionItem.jsx
// No need to import AuthLayout here! (Important to avoid duplication)

// Import FAQ data from the JSON file
import faqData from '../data/faqData.json';

// Import the AccordionItem component we created
import AccordionItem from '../components/AccordionItem.jsx';

const HelpPage = () => {
  return (
    // We removed the AuthLayout wrapper from here! (as explained, it's in App.jsx)
    <div className="container mx-auto px-4 py-8">
      {/* Shortened and centered intro */}
      <div className="text-center mb-8" dir="ltr">
        <h1 className="text-2xl font-bold text-dark-gray-text mb-4">Welcome to the Help & Support page of the Shalom Platform!</h1>
        <p className="text-lg text-gray-text max-w-2xl mx-auto mt-4">
          We are here to ensure you a comfortable and enjoyable experience.
        </p>
      </div>

      {/* Frequently Asked Questions Section */}
      {/* הגדלתי את ה-mt ל-24 כדי ליצור מרווח משמעותי מהסעיף הקודם */}
      <h2 className="text-2xl font-bold text-golden-brown mb-6 text-left mt-24" dir="ltr">Frequently Asked Questions</h2>

      {/* Loop over FAQ data to render each accordion item */}
      <div className="space-y-4"> {/* Spacing between accordion items */}
        {faqData.map((item, index) => (
          <AccordionItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>

      {/* Smart Usage Tips section - styled with lightbulb icons */}
      {/* הגדלתי את ה-mt ל-24 כדי ליצור מרווח משמעותי מהסעיף הקודם */}
      <div className="text-left mt-24" dir="ltr">
        <h2 className="text-2xl font-bold text-golden-brown mb-6">Tips</h2>
        
        <div className="space-y-6"> {/* Adds spacing between each tip block */}
          
          {/* Tip 1: Efficient Search */}
          <div className="flex items-start">
            <span className="mr-3 text-2xl text-golden-brown">💡</span>
            <div>
              <h3 className="text-xl font-semibold text-dark-gray-text mb-1">Efficient Search</h3>
              <p className="text-base text-gray-text">Use the search bar located at the top of the page to quickly find specific places, posts, or events by name, category, or location.</p>
            </div>
          </div>

          {/* Tip 2: Navigate by Categories */}
          <div className="flex items-start">
            <span className="mr-3 text-2xl text-golden-brown">💡</span>
            <div>
              <h3 className="text-xl font-semibold text-dark-gray-text mb-1">Navigate by Categories</h3>
              <p className="text-base text-gray-text">Browse through the different categories (such as restaurants, synagogues, community events) to discover new content tailored to your interests.</p>
            </div>
          </div>

          {/* Tip 3: Save to Favorites */}
          <div className="flex items-start">
            <span className="mr-3 text-2xl text-golden-brown">💡</span>
            <div>
              <h3 className="text-xl font-semibold text-dark-gray-text mb-1">Save to Favorites</h3>
              <p className="text-base text-gray-text">Mark places and posts you liked with the heart icon, and you can easily return to them anytime via your "Favorites" page.</p>
            </div>
          </div>

          {/* Tip 4: Enable Notifications */}
          <div className="flex items-start">
            <span className="mr-3 text-2xl text-golden-brown">💡</span>
            <div>
              <h3 className="text-xl font-semibold text-dark-gray-text mb-1">Enable Notifications</h3>
              <p className="text-base text-gray-text">To stay updated, make sure your notification settings are enabled. This way you'll receive important updates on comments, likes, or new posts in your area.</p>
            </div>
          </div>

          {/* Tip 5: Use Interactive Map */}
          <div className="flex items-start">
            <span className="mr-3 text-2xl text-golden-brown">💡</span>
            <div>
              <h3 className="text-xl font-semibold text-dark-gray-text mb-1">Use Interactive Map</h3>
              <p className="text-base text-gray-text">Find places near you easily and conveniently using the integrated map display on the platform.</p>
            </div>
          </div>

        </div> {/* End div for space-y-6 */}
      </div>

      {/* "We Are Here For You" section - centered */}
      {/* הגדלתי את ה-mt ל-24 כדי ליצור מרווח משמעותי מהסעיף הקודם */}
      <div className="text-center mt-24">
        <h2 className="text-3xl font-bold text-golden-brown mb-6">We Are Here For You</h2>
        <p className="text-base text-gray-text mb-4">
          The Shalom platform was built out of  love for the community and a desire to connect people, places, and shared values.
        </p>
        <p className="text-base text-gray-text mb-4">
          We see you as true partners. If you have ideas for improvement, suggestions for new features, or encountered any issue – please do not hesitate to contact us.
        </p>
        <p className="text-base text-gray-text">
          Together we will continue to build a warm, accessible, and meaningful digital community for all users.
        </p>
        <p className="text-lg font-bold text-golden-brown mt-6">
          Thank you for being part of the Shalom family!
        </p>
      </div>
    </div>
  );
};

export default HelpPage;