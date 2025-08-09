// src/features/locations/LocationList.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';

import LocationCard from './LocationCard';
import CategoryFilter from '../../components/CategoryFilter';
import InfiniteScrollWrapper from '../../components/InfiniteScrollWrapper';
import CustomAlertDialog from '../../features/PlaceDetail/CustomAlertDialog'; // נשאר עבור הודעות כלליות
import axios from 'axios';

import {
  fetchLocations,
  resetLocations,
  selectAllLocations,
  selectLocationsStatus,
} from './locationSlice';

import { AuthContext } from '../../layouts/AuthLayout';

const LocationList = () => {
  // Debug: Check and remove overflow-hidden from body and html
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    console.log('body.style.overflow:', body.style.overflow);
    console.log('html.style.overflow:', html.style.overflow);
    if (body.style.overflow === 'hidden') {
      console.warn('Removing overflow:hidden from body');
      body.style.overflow = '';
    }
    if (html.style.overflow === 'hidden') {
      console.warn('Removing overflow:hidden from html');
      html.style.overflow = '';
    }
  }, []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId: currentUserId, currentUser } = useContext(AuthContext);
  const { creatorId } = useParams();

  const isAdmin = currentUser?.role === 'admin';

  const locations = useSelector(selectAllLocations);
  const { loading, error, page, hasMore } = useSelector(selectLocationsStatus);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [alertDialog, setAlertDialog] = useState(null);
  // ✅ הוסר showDeleteConfirm מכיוון שהוא יטופל ב-ItemCard
  // ✅ הוסר activeDropdown מכיוון שאין תפריט נשלף לניהול
  // ✅ הוסר dropdownRef מכיוון שאין תפריט נשלף לניהול

  const [searchParams, setSearchParams] = useSearchParams();

  // Always start from page 1 for infinite scroll, URL is only for display
  const limitFromURL = parseInt(searchParams.get('limit')) || 6;

  // Debug: Print hasMore and loading to console (after all hooks)
  console.log('LocationList debug:', { hasMore, loading, locationsLength: locations.length });

  // Debug: Print hasMore and loading to console (after all hooks)
  console.log('LocationList debug:', { hasMore, loading, locationsLength: locations.length });

  useEffect(() => {
    console.log("LocationList: useEffect triggered.");
    console.log("LocationList: current creatorId from URL params:", creatorId);
    console.log("LocationList: current currentUserId from AuthContext:", currentUserId);

    // Always reset URL to page=1 on mount/filter change
    setSearchParams({ page: 1, limit: limitFromURL });

    dispatch(resetLocations());

    const fetchUserId = creatorId ? creatorId : undefined;
    console.log("LocationList: Fetching locations with userId:", fetchUserId);

    // Only load page 1 on mount/filter change
    dispatch(fetchLocations({ page: 1, limit: limitFromURL, userId: fetchUserId, category_id: selectedCategory }));
  }, [dispatch, creatorId, limitFromURL, selectedCategory]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    dispatch(resetLocations());
    const fetchUserId = creatorId ? creatorId : undefined;
    dispatch(fetchLocations({ page: 1, limit: limitFromURL, userId: fetchUserId, category_id: value }));
    // Do NOT update URL on filter change
  };

  // Prevent multiple loadMore calls while loading
  const isLoadingRef = useRef(false);
  useEffect(() => {
    isLoadingRef.current = loading === 'pending';
  }, [loading]);

  const loadMore = () => {
    console.log('loadMore called:', { loading, hasMore, page });
    if (isLoadingRef.current) {
      console.log('loadMore blocked: already loading');
      return;
    }
    if (hasMore) {
      const nextPage = page + 1;
      const fetchUserId = creatorId ? creatorId : undefined;
      console.log('Dispatching fetchLocations for nextPage:', nextPage);
      dispatch(fetchLocations({ page: nextPage, limit: limitFromURL, userId: fetchUserId, category_id: selectedCategory }));
      // Update the URL to reflect the current page, but do not trigger reload
      setSearchParams({ page: nextPage, limit: limitFromURL });
    }
  };

  // ✅ פונקציה לטיפול במחיקה מוצלחת מ-ItemCard (תיקון שם הפרמטר)
  const handleLocationDeleted = (deletedItemId) => {
    setAlertDialog({ type: 'success', message: 'המקום נמחק בהצלחה!' });
    dispatch(resetLocations()); // איפוס הרידקס
    const fetchUserId = creatorId ? creatorId : undefined;
    dispatch(fetchLocations({ page: 1, limit: limitFromURL, userId: fetchUserId, category_id: selectedCategory })); // טעינה מחדש של הנתונים
    setTimeout(() => setAlertDialog(null), 3000);
  };


  if (loading === 'pending' && (!Array.isArray(locations) || locations.length === 0)) {
    return (
      <div className="flex justify-center items-center h-40">
        <svg
          className="animate-spin h-10 w-10 text-cyan-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-600 text-center mt-6">
        Error loading locations: {error}
      </p>
    );
  } else if (locations.length === 0 && !loading) {
    return (
      <p className="text-center mt-8 text-gray-600">לא נמצאו מקומות.</p>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 pt-16">
      <CustomAlertDialog
        message={alertDialog?.message}
        type={alertDialog?.type}
        onConfirm={alertDialog?.onConfirm || (() => setAlertDialog(null))}
        onCancel={alertDialog?.onCancel || (() => setAlertDialog(null))}
        showCancel={alertDialog?.showCancel || false}
      />
      {/* ✅ הוסר מודאל האישור מחיקה מכאן, יטופל ב-ItemCard */}

      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
        {creatorId ? `מקומות של יוצר: ${locations[0]?.user_name || creatorId}` : 'מקומות בקהילה'}
      </h2>

      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      <InfiniteScrollWrapper
        loadMore={loadMore}
        hasMore={hasMore}
        isLoading={loading === 'pending'}
      >
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {locations.map((locationItem) => (
            locationItem && (
              <div key={locationItem.id} className="flex items-start w-full relative">
                <LocationCard
                  location={locationItem}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onDeleteSuccess={handleLocationDeleted} 
                />
              </div>
            )
          ))}
        </div>
      </InfiniteScrollWrapper>
      {/* כפתור טען עוד הוסר - טעינה רק באינסוף סקרול */}
    </div>
  );
};

export default LocationList;