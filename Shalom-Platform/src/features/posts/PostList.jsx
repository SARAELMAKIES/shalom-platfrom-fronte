// src/features/posts/PostList.jsx
import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import axios from 'axios';

import { selectAllPosts, fetchPosts, resetPosts } from './postsSlice';
import PostCard from './PostCard';
import CategoryFilter from '../../components/CategoryFilter';
import InfiniteScrollWrapper from '../../components/InfiniteScrollWrapper';
import CustomAlertDialog from '../PlaceDetail/CustomAlertDialog';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { AuthContext } from '../../layouts/AuthLayout';

const PostList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId: currentUserId, currentUser } = useContext(AuthContext);
  const { creatorId } = useParams();

  const isAdmin = currentUser?.role === 'admin';

  const posts = useSelector(selectAllPosts);
  const loading = useSelector((state) => state.posts.loading);
  const error = useSelector((state) => state.posts.error);
  const page = useSelector((state) => state.posts.page);
  const hasMore = useSelector((state) => state.posts.hasMore);

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [alertDialog, setAlertDialog] = useState(null);

  // קבלת הערכים מפרמטרי החיפוש ב-URL
  const pageFromURL = parseInt(searchParams.get('page')) || 1;
  const limitFromURL = parseInt(searchParams.get('limit')) || 6;
  const categoryFromURL = searchParams.get('category_id') || '';

  // עדכון קטגוריה בהתבסס על ה-URL ואיפוס פוסטים רק כאשר מחליפים יוצר (creatorId) או קטגוריה
  useEffect(() => {
    setSelectedCategory(categoryFromURL);
    dispatch(resetPosts());
  }, [categoryFromURL, creatorId, dispatch]);

  // לוגיקת טעינה ראשונית וטעינה מחדש בעקבות שינויים ב-URL או ב-creatorId
  useEffect(() => {
    console.log("PostList: useEffect triggered.");
    console.log("PostList: current creatorId from URL params:", creatorId);
    console.log("PostList: current currentUserId from AuthContext:", currentUserId);

    setSearchParams({ page: 1, limit: limitFromURL, category_id: categoryFromURL });

    const fetchUserId = creatorId ? creatorId : undefined;
    console.log("PostList: Fetching posts with userId:", fetchUserId, "and page:", 1, "and category:", categoryFromURL);

    dispatch(fetchPosts({
      page: 1,
      limit: limitFromURL,
      userId: fetchUserId,
      category_id: categoryFromURL
    }));
  }, [dispatch, creatorId, pageFromURL, limitFromURL, categoryFromURL]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    // איפוס ומעבר לעמוד 1 בעת שינוי קטגוריה
    dispatch(resetPosts());
    setSearchParams({ page: 1, limit: limitFromURL, category_id: value });
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      const fetchUserId = creatorId ? creatorId : undefined;
      // שליחת הבקשה לעמוד הבא
      dispatch(fetchPosts({
        page: nextPage,
        limit: limitFromURL,
        userId: fetchUserId,
        category_id: selectedCategory
      }));
      // עדכון ה-URL עם מספר העמוד החדש
      setSearchParams({ page: nextPage, limit: limitFromURL, category_id: selectedCategory });
    }
  };

  const handlePostDeleted = (deletedItemId) => {
    setAlertDialog({ type: 'success', message: 'הפוסט נמחק בהצלחה!' });
    // טעינה מחדש לאחר מחיקה, כדי להציג את הנתונים המעודכנים
    dispatch(resetPosts());
    const fetchUserId = creatorId ? creatorId : undefined;
    dispatch(fetchPosts({ page: 1, limit: limitFromURL, userId: fetchUserId, category_id: selectedCategory }));
    setTimeout(() => setAlertDialog(null), 3000);
  };

  if (loading && (!Array.isArray(posts) || posts.length === 0)) {
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
        Error loading posts: {error}
      </p>
    );
  } else if (posts.length === 0 && !loading) {
    return (
      <p className="text-center mt-8 text-gray-600">לא נמצאו פוסטים.</p>
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

      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
        {creatorId ? `פוסטים של יוצר: ${posts[0]?.user_name || creatorId}` : 'פוסטים בקהילה'}
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
          {posts.map((postItem) => (
            postItem && (
              <div key={postItem.id} className="flex items-start w-full relative">
                <PostCard
                  post={postItem}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onDeleteSuccess={handlePostDeleted}
                />
              </div>
            )
          ))}
        </div>
      </InfiniteScrollWrapper>
    </div>
  );
};

export default PostList;
