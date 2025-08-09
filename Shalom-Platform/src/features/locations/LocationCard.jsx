// src/features/locations/LocationCard.jsx
import React from 'react';
import ItemCard from '../../components/ItemCard';
import { Link as RouterLink } from 'react-router-dom';

const LocationCard = ({ location, handlers }) => {
  const extraInfo = (
    <>
      <div>Category: {location.category_id}</div>
      {(location.city || location.area || location.country) && (
        <div>
          Location: {[location.city, location.area, location.country].filter(Boolean).join(', ')}
        </div>
      )}
      <div className="mt-2">
        {/* קישור "כתוב פוסט על המקום הזה" הוסר כפי שביקשת בתגובה קודמת */}
      </div>
    </>
  );

  return (
    <ItemCard
      itemId={location.id}
      title={location.name}
      description={location.description}
      images={location.images}
      userName={location.user_name}
      userId={location.user_id}
      createdAt={location.created_at}
      views={location.views}
      itemType="location"
      currentUserId={handlers?.currentUserId || 1}
      category={location.category_name || location.category || location.category_id || 'Not provided'}
      location={[location.city, location.area, location.country].filter(Boolean).join(', ') || location.location || 'Not provided'}
      itemUrl={`/place/${location.id}`}
      onLike={handlers?.onLike}
      onReport={handlers?.onReport}
      onShare={handlers?.onShare}
    />
  );
};

export default LocationCard;
