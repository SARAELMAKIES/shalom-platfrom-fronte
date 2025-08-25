
// src/components/FavoritesPage.jsx
import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useSelector } from 'react-redux';
import { selectFavorites } from '../features/posts/favoritesSlice';
import ItemCard from './ItemCard';
// ✅ תיקון נתיב הייבוא של UserContext
import { UserContext } from '../UserContext'; 
import { getFavoriteItemsByIds } from '../api/favoriteApi';

const FavoritesPage = () => {
  const favoriteItemIdsObject = useSelector(selectFavorites);
  const { currentUser } = useContext(UserContext);
  const currentUserId = currentUser?.id;

  // Debugging: Log the state of favoriteItemIdsObject and currentUserId on component render
  console.log("FavoritesPage Render: favoriteItemIdsObject (from Redux/localStorage):", favoriteItemIdsObject);
  console.log("FavoritesPage Render: currentUserId (from UserContext):", currentUserId);

  const favoriteItemIds = useMemo(() => Object.keys(favoriteItemIdsObject), [favoriteItemIdsObject]);

  const [favoriteItemsData, setFavoriteItemsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Debugging: Log the state inside useEffect
    console.log("FavoritesPage useEffect: favoriteItemIds (derived from Redux):", favoriteItemIds);
    console.log("FavoritesPage useEffect: currentUserId (inside useEffect):", currentUserId);

    const loadFavoriteItems = async () => {
      // אם אין משתמש מחובר, הצג הודעה מתאימה
      if (!currentUserId) {
        console.log("FavoritesPage: User not logged in according to UserContext, skipping fetch.");
        setLoading(false);
        setError('יש להתחבר כדי לצפות במועדפים.');
        setFavoriteItemsData([]);
        return;
      }

      // אם אין מזהי מועדפים ב-Redux (כלומר, לא נשמרו ב-localStorage או נוקו)
      if (favoriteItemIds.length === 0) {
        console.log("FavoritesPage: No favorite IDs found in Redux store, setting empty data.");
        setFavoriteItemsData([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        console.log(`FavoritesPage: Attempting to fetch items with IDs: ${favoriteItemIds.join(',')}`);
        // const response = await fetch(`http://localhost:3001/api/items/by-ids?ids=${favoriteItemIds.join(',')}`);
        // if (!response.ok) {
        //   const errorText = await response.text();
        //   throw new Error(`Failed to fetch favorite items: ${response.status} ${errorText}`);
        // }
        // const data = await response.json();
        const response = await getFavoriteItemsByIds(favoriteItemIds);
const data = response.data;
        console.log("FavoritesPage: Successfully fetched favorite items data:", data);
        setFavoriteItemsData(data);
      } catch (err) {
        console.error("FavoritesPage: Error loading favorite items:", err);
        setError(`Failed to load favorite items. Please try again. Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteItems();
  }, [favoriteItemIds, currentUserId]); // תלויות ב-favoriteItemIds וב-currentUserId

  if (loading) return <div className="text-center p-4">טוען מועדפים...</div>;
  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;
  if (favoriteItemsData.length === 0) return <div className="text-center p-4">עדיין אין לך פריטים מועדפים.</div>;

  return (
    <div className="container mx-auto p-4 max-w-6xl"> {/* Adjusted max-w to 6xl for wider layout */}
      <h1 className="text-3xl font-bold text-golden-brown mb-6 text-center">מועדפים</h1>
      <p className="text-gray-700 text-center mb-6">כאן יוצגו המקומות והפוסטים שסימנת כמועדפים.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {favoriteItemsData.map(item => (
          <ItemCard
            key={item.id}
            itemId={item.id}
            title={item.title || item.name}
            description={item.description || item.content}
            images={item.images}
            userName={item.user_name}
            userId={item.user_id}
            createdAt={item.created_at}
            itemUrl={item.type === 'location' ? `/place/${item.id}` : `/post/${item.id}`}
            views={item.views}
            itemType={item.type}
            currentUserId={currentUserId}
            category={item.category_id} 
            location={item.city || item.area} 
            onSelect={() => {}} // ✅ הוספת onSelect פונקציה ריקה
          />
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
