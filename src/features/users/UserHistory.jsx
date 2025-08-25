import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { AuthContext } from "../../layouts/AuthLayout";
import userService from '../../api/userService'; // ✅ ייבוא שירות המשתמשים

function UserHistory() {
  const { userId } = useContext(AuthContext); 

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("UserHistory: Initial userId from AuthContext:", userId);

  useEffect(() => {
    console.log("UserHistory useEffect: userId value:", userId);

    if (!userId) { 
      console.log("UserHistory: userId is null or undefined, skipping fetch.");
      setLoading(false);
      setError("User ID not available. Please log in."); 
      return;
    }

    async function loadUserHistory() { // ✅ שינוי שם הפונקציה לבהירות
      try {
        setLoading(true);
        setError(null);
        // ✅ קריאה לפונקציה מתוך userService
        const data = await userService.fetchUserHistory(userId); 
        console.log("📜 מה השרת מחזיר:", data);
        setHistory(data);
      } catch (err) {
        setError(err.message);
        console.error("UserHistory: Error fetching history:", err); 
      } finally {
        setLoading(false);
      }
    }

    loadUserHistory(); // ✅ קריאה לפונקציה החדשה
  }, [userId]); 

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const iconMap = {
    post: 'FileText',
    location: 'MapPin',
    comment: 'MessageSquare',
    vote: 'ThumbsUp',
    report: 'Flag',
  };

  const ActionIcon = ({ type }) => {
    const iconName = iconMap[type] || 'Activity';
    const LucideIcon = LucideIcons[iconName];
    return LucideIcon ? <LucideIcon className="w-5 h-5 text-indigo-500 mt-1" /> : null; 
  };

  const formatAction = (action) => {
    switch (action.action_type) {
      case 'post':
        return `Posted: "${action.description}"`;
      case 'location':
        return `Added a location: "${action.description}"`;
      case 'comment':
        return `Commented: "${action.description}"`;
      case 'vote':
        return `Voted on: ${action.description}`;
      case 'report':
        return `Reported: ${action.description}`;
      default:
        return action.description || 'Performed an action';
    }
  };

  // Sort so items with no date appear last
  const sortedHistory = [...history].sort((a, b) => {
    if (!a.created_at) return 1;
    if (!b.created_at) return -1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (loading) return <p className="text-center py-6 text-gray-500">Loading activity...</p>;
  if (error) return <p className="text-center py-6 text-red-500">Error: {error}</p>;
  if (!history.length) return <p className="text-center py-6 text-gray-400">No activity found.</p>;

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 font-inter pt-16">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">User Activity History</h2>
      <ul className="space-y-4">
        {sortedHistory.map((item, index) => {
          const formattedDate = formatDate(item.created_at);
          return (
            <li
              key={item.action_id ? `${item.action_type}-${item.action_id}` : index}
              className="flex items-start gap-4 border-b border-gray-100 pb-4"
            >
              <div>
                <ActionIcon type={item.action_type} />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{formatAction(item)}</p>
                {formattedDate && <small className="text-gray-500">{formattedDate}</small>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default UserHistory;
