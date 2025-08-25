// src/components/MyLocationsPage.jsx
import React, { useEffect, useContext, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../layouts/AuthLayout';
import ItemCard from '../components/ItemCard';
import CustomAlertDialog from '../features/PlaceDetail/CustomAlertDialog';
import InfiniteScrollWrapper from '../components/InfiniteScrollWrapper';
import { fetchUserLocationsPaginated, resetMyLocations, selectAllMyLocations, selectMyLocationsStatus } from '../features/myLocations/myLocationsSlice';

const MyLocationsPage = () => {
  const { userId, currentUser } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const locations = useSelector(selectAllMyLocations);
  const { loading, error, page, hasMore } = useSelector(selectMyLocationsStatus);
  const [alertDialog, setAlertDialog] = React.useState(null);
  const isLoadingRef = useRef(false);

useEffect(() => {
  // Only reset and set page 1 when userId changes (first mount or user switch)
  if (userId) {
    setSearchParams({ page: 1, limit: 6 });
    dispatch(resetMyLocations());
    dispatch(fetchUserLocationsPaginated({ userId, page: 1, limit: 6 }));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [userId]);

  useEffect(() => {
    isLoadingRef.current = loading;
  }, [loading]);

  const loadMore = () => {
    if (isLoadingRef.current || !hasMore) return;
    if (userId) {
      dispatch(fetchUserLocationsPaginated({ userId, page: page + 1, limit: 6 }));
      setSearchParams({ page: page + 1, limit: 6 });
    }
  };

  // ✅ הוסר useEffect לטיפול בלחיצה מחוץ לתפריט נשלף

  // ✅ הוסרו פונקציות toggleDropdown, handleDeleteLocation, handleEditLocation
  // מכיוון שהן יטופלו על ידי ItemCard ישירות

  // ✅ פונקציה לטיפול במחיקה מוצלחת מ-ItemCard
  const handleLocationDeleted = () => {
    setAlertDialog({ type: 'success', message: 'המיקום נמחק בהצלחה!' });
    fetchUserLocations(); // רענן את רשימת המיקומים
    setTimeout(() => setAlertDialog(null), 3000);
  };

  if (loading && locations.length === 0) {
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-dark-gray-text">טוען מיקומים...</h2>
        <p className="text-gray-text mb-6">אנא המתן...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-red-600">שגיאה!</h2>
        <p className="text-gray-text mb-6">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 font-inter pt-16">
      <CustomAlertDialog
        message={alertDialog?.message}
        type={alertDialog?.type}
        onConfirm={alertDialog?.onConfirm || (() => setAlertDialog(null))}
        onCancel={alertDialog?.onCancel || (() => setAlertDialog(null))}
        showCancel={alertDialog?.showCancel || false}
      />
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">המקומות שלי</h2>
      {locations.length === 0 ? (
        <p className="text-center py-6 text-gray-400">לא נמצאו מיקומים שיצרת.</p>
      ) : (
        <InfiniteScrollWrapper loadMore={loadMore} hasMore={hasMore} isLoading={loading}>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {locations.map((locationItem) => (
              locationItem && (
                <div key={locationItem.id} className="flex items-start w-full relative">
                  <ItemCard
                    itemId={locationItem.id}
                    title={locationItem.name}
                    description={locationItem.description}
                    images={locationItem.images}
                    userName={locationItem.user_name}
                    userId={locationItem.user_id}
                    createdAt={locationItem.created_at}
                    views={locationItem.views}
                    itemType="location"
                    itemUrl={`/place/${locationItem.id}`}
                    currentUserId={userId}
                    isAdmin={currentUser?.role === 'admin'}
                    category={locationItem.category_name}
                    location={locationItem.address || locationItem.city}
                    onDeleteSuccess={() => {
                      setAlertDialog({ type: 'success', message: 'המקום נמחק בהצלחה!' });
                      dispatch(resetMyLocations());
                      dispatch(fetchUserLocationsPaginated({ userId, page: 1, limit: 6 }));
                      setTimeout(() => setAlertDialog(null), 3000);
                    }}
                  />
                </div>
              )
            ))}
          </div>
        </InfiniteScrollWrapper>
      )}
    </div>
  );
};

export default MyLocationsPage;
