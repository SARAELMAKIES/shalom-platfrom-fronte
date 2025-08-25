import React, { useEffect, useContext, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../layouts/AuthLayout';
import ItemCard from '../components/ItemCard';
import CustomAlertDialog from '../features/PlaceDetail/CustomAlertDialog';
import InfiniteScrollWrapper from '../components/InfiniteScrollWrapper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserPostsPaginated, resetMyPosts, selectAllMyPosts, selectMyPostsStatus } from '../features/myPosts';

const MyPostsPage = () => {
  const { userId, currentUser } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const posts = useSelector(selectAllMyPosts);
  const { loading, error, page, hasMore } = useSelector(selectMyPostsStatus);
  const [alertDialog, setAlertDialog] = React.useState(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (userId) {
      setSearchParams({ page: 1, limit: 6 });
      dispatch(resetMyPosts());
      dispatch(fetchUserPostsPaginated({ userId, page: 1, limit: 6 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    isLoadingRef.current = loading;
  }, [loading]);

  const loadMore = () => {
    if (isLoadingRef.current || !hasMore) return;
    if (userId) {
      dispatch(fetchUserPostsPaginated({ userId, page: page + 1, limit: 6 }));
      setSearchParams({ page: page + 1, limit: 6 });
    }
  };

  // ✅ הוסר useEffect לטיפול בלחיצה מחוץ לתפריט נשלף

  // ✅ הוסרו פונקציות toggleDropdown, handleDeletePost, handleEditPost
  // מכיוון שהן יטופלו על ידי ItemCard ישירות

  // ✅ פונקציה לטיפול במחיקה מוצלחת מ-ItemCard
  const handlePostDeleted = () => {
    setAlertDialog({ type: 'success', message: 'הפוסט נמחק בהצלחה!' });
    dispatch(resetMyPosts());
    dispatch(fetchUserPostsPaginated({ userId, page: 1, limit: 6 }));
    setTimeout(() => setAlertDialog(null), 3000);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-dark-gray-text">טוען פוסטים...</h2>
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
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">הפוסטים שלי</h2>
      {posts.length === 0 ? (
        <p className="text-center py-6 text-gray-400">לא נמצאו פוסטים שיצרת.</p>
      ) : (
        <InfiniteScrollWrapper loadMore={loadMore} hasMore={hasMore} isLoading={loading}>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {posts.map((postItem) => (
              postItem && (
                <div key={postItem.id} className="flex items-start w-full relative">
                  <ItemCard
                    itemId={postItem.id}
                    title={postItem.title}
                    description={postItem.content}
                    images={postItem.images}
                    userName={postItem.user_name}
                    userId={postItem.user_id}
                    createdAt={postItem.created_at}
                    views={postItem.views}
                    itemType="post"
                    itemUrl={`/post/${postItem.id}`}
                    currentUserId={userId}
                    isAdmin={currentUser?.role === 'admin'}
                    category={postItem.category_name}
                    onSelect={() => {}}
                    isSelected={false}
                    location={postItem.city || postItem.area}
                    onDeleteSuccess={handlePostDeleted}
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

export default MyPostsPage;
