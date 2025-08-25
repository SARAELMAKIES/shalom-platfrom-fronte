// PostDetail.jsx - עמוד פוסט מלא
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../layouts/AuthLayout';
import CustomAlertDialog from '../PlaceDetail/CustomAlertDialog';
import ShareButtons from '../PlaceDetail/ShareButtons';
import CommentItem from '../PlaceDetail/CommentItem';
import { FaThumbsUp, FaHeart, FaRegHeart, FaFlag, FaEye } from 'react-icons/fa';
import { selectFavorites, toggleFavorite } from '../posts/favoritesSlice';
import { selectIsLiked, selectTotalLikes, toggleVote } from '../../features/likes/likesSlice';
import { buildCommentTree } from './buildCommentTree';

// ✅ ייבוא שירותי ה-API החדשים
import commentsApi from '../../api/commentsApi';
import postsApi from '../../api/postsApi';
import reportsApi from '../../api/reportsApi';


const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userId } = useContext(AuthContext);
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);
  const isFavorite = !!favorites[id];
  const isLiked = useSelector((state) => selectIsLiked(state, `${id}_post`));
  const totalLikes = useSelector((state) => selectTotalLikes(state, `${id}_post`));

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertDialog, setAlertDialog] = useState(null);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState([]);
  const [showReplyInputId, setShowReplyInputId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      // ✅ קריאה דרך commentsApi
      const data = await commentsApi.fetchCommentsForPost(id);
      setComments(buildCommentTree(data));
    } catch (err) {
      console.error('שגיאה בטעינת תגובות:', err);
      setAlertDialog({ type: 'error', message: 'שגיאה בטעינת תגובות.' });
    }
  }, [id]);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        // ✅ קריאה דרך postsApi
        const data = await postsApi.fetchPostById(id);
        setPost(data);
        setViews(data.views || 0);
        fetchComments();
      } catch (err) {
        setAlertDialog({ type: 'error', message: err.message || 'שגיאה בטעינת הפוסט' });
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, fetchComments]);

  const handleLike = async () => {
    if (!currentUser) {
      setAlertDialog({ type: 'error', message: 'יש להתחבר כדי לעשות לייק.' });
      return;
    }
    dispatch(toggleVote({
      itemId: id,
      userId,
      itemType: 'post',
      isLiked
    }))
      .unwrap()
      .catch(() => {
        setAlertDialog({ type: 'error', message: 'שגיאה בשליחת לייק' });
      });
  };

  const handleFavorite = () => {
    if (!currentUser) {
      setAlertDialog({ type: 'error', message: 'יש להתחבר כדי להוסיף למועדפים.' });
      return;
    }
    dispatch(toggleFavorite(id));
  };

  const handleReport = async () => {
    if (!currentUser) {
      setAlertDialog({ type: 'error', message: 'יש להתחבר כדי לדווח.' });
      return;
    }
    try {
      // ✅ קריאה דרך reportsApi
      await reportsApi.createReport({
        user_id: userId,
        item_id: id,
        item_type: 'post',
        reason: 'דיווח ממשתמש'
      });
      setAlertDialog({ type: 'success', message: 'הדיווח נשלח בהצלחה.' });
    } catch (error) { // ✅ תפוס את השגיאה
      console.error('שגיאה בשליחת הדיווח:', error);
      setAlertDialog({ type: 'error', message: 'שגיאה בשליחת הדיווח.' });
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      setCommentError('נא להקליד תגובה');
      return;
    }
    if (!currentUser) {
      setAlertDialog({
        type: 'error',
        message: 'יש להתחבר כדי לכתוב תגובה.',
        onConfirm: () => navigate('/signin'),
        showCancel: true,
        onCancel: () => setAlertDialog(null)
      });
      return;
    }

    try {
      // ✅ קריאה דרך commentsApi
      await commentsApi.addComment({
        item_id: id,
        item_type: 'post',
        user_id: userId,
        content: newComment,
        parent_id: null,
        created_at: new Date().toISOString()
      });
      setNewComment('');
      fetchComments();
    } catch (error) { // ✅ תפוס את השגיאה
      console.error('שגיאה בשליחת תגובה:', error);
      setAlertDialog({ type: 'error', message: 'שגיאה בשליחת תגובה.' });
    }
  };

  const handleReplySubmit = async (parentId, content) => {
    if (!currentUser) {
      setAlertDialog({
        type: 'error',
        message: 'יש להתחבר כדי לכתוב תגובה.',
        onConfirm: () => navigate('/signin'),
        showCancel: true,
        onCancel: () => setAlertDialog(null)
      });
      return { type: 'error', message: 'יש להתחבר כדי לכתוב תגובה.' };
    }
    try {
      // ✅ קריאה דרך commentsApi
      await commentsApi.addComment({
        item_id: id,
        item_type: 'post',
        user_id: userId,
        content,
        parent_id: parentId,
        created_at: new Date().toISOString()
      });
      setShowReplyInputId(null);
      fetchComments();
      return { type: 'success', message: 'התגובה נשלחה בהצלחה!' };
    } catch (error) { // ✅ תפוס את השגיאה
      console.error('שגיאה בשליחת תגובה:', error);
      return { type: 'error', message: 'שגיאה בשליחת תגובה.' };
    }
  };


  const formattedDate = post?.created_at
    ? new Date(post.created_at).toLocaleDateString('he-IL')
    : 'לא ידוע';

  if (loading) return <div className="text-center py-16">טוען פוסט...</div>;
  if (!post) return <div className="text-center py-16 text-red-600">שגיאה: הפוסט לא נמצא.</div>; // ✅ טיפול במקרה שהפוסט לא נמצא

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4 font-inter text-right">
      <CustomAlertDialog
        message={alertDialog?.message}
        type={alertDialog?.type}
        onConfirm={alertDialog?.onConfirm || (() => setAlertDialog(null))}
        showCancel={alertDialog?.showCancel}
        onCancel={alertDialog?.onCancel || (() => setAlertDialog(null))}
      />

      <h1 className="text-3xl font-bold text-golden-brown-dark mb-2 border-b border-gray-200 pb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-1">
        נכתב ע״י <span className="font-semibold">{post.user_name}</span> בתאריך {formattedDate}
      </p>
      {post.category_id && post.category_name && (
        <p className="text-sm text-blue-600 mb-4">
          <Link to={`/community-posts?category_id=${post.category_id}`}>#{post.category_name}</Link>
        </p>
      )}

      {post.image && (
        <img
          src={`http://localhost:3001/uploads/${post.image}`}
          alt="תמונה ראשית"
          className="w-full h-auto rounded-md shadow mb-6"
        />
      )}

      <div className="prose text-gray-800 leading-relaxed mb-6 max-w-none">
        {post.content}
      </div>

      <div className="flex flex-wrap gap-4 items-center border-t pt-4 text-gray-600 text-sm mb-8">
        <button onClick={handleLike} className={`flex items-center gap-1 hover:text-blue-600 ${isLiked ? 'text-blue-600' : ''}` }>
          <FaThumbsUp /> {totalLikes}
        </button>
        <button onClick={handleFavorite} className={`flex items-center gap-1 hover:text-red-500 ${isFavorite ? 'text-red-500' : ''}` }>
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
        <button onClick={handleReport} className="flex items-center gap-1 hover:text-red-600">
          <FaFlag />
        </button>
        <div className="flex items-center gap-1">
          <FaEye /> {views} צפיות
        </div>
        <ShareButtons itemUrl={window.location.href} title={post.title} />
      </div>

      {/* תגובות */}
      <div className="bg-white p-6 shadow-md border border-gray-200 rounded-md mb-12">
        <h3 className="text-lg font-bold text-golden-brown-dark mb-4 border-b pb-2">תגובות</h3>


        {comments.length > 0 ? (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUser={currentUser}
              onReplySubmitted={handleReplySubmit} 
              //{/* ✅ השתמש בפונקציה המאוחדת */}
              activeReplyId={showReplyInputId}
              onToggleReplyInput={setShowReplyInputId}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">אין תגובות עדיין.</p>
        )}

        <div className="mt-6">
          <textarea
            className="w-full border rounded p-3 text-sm focus:ring-2 focus:ring-golden-brown-light"
            rows="4"
            placeholder="הוסף תגובה..."
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              setCommentError('');
            }}
          />
          {commentError && <p className="text-red-500 text-xs mt-1">{commentError}</p>}
          <button
            onClick={handleSubmitComment}
            className="mt-3 bg-golden-brown text-white font-bold py-2 px-4 rounded hover:bg-golden-brown-dark transition"
          >
            שלח תגובה
          </button>
        </div>
      </div>

      <Link to="/community-posts" className="text-link-blue hover:underline">
        ← חזרה לרשימת הפוסטים הקהילתיים
      </Link>
    </div>
  );
};

export default PostDetail;
