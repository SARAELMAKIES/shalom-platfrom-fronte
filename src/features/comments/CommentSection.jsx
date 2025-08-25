// export default CommentSection;import React, { useEffect, useMemo, useState } from 'react';import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchCommentsByItem,
  makeSelectCommentsByItem,
  addComment,
} from './commentsSlice';
import AddCommentForm from './AddCommentForm';

const CommentThread = ({
  comments,
  parent_id = null,
  onReply,
  replyTo,
  onSubmit,
  current_user_id,
  item_id,
  item_type,
  depth = 0,
}) => {
  // מסננים תגובות שרלוונטיות לאותו parent_id
  const filteredComments = comments.filter(c => c.parent_id === parent_id);

  return filteredComments.map(comment => (
    <div
      key={comment.id}
      style={{
        marginLeft: depth * 20,
        borderLeft: '2px solid #ccc',
        paddingLeft: 8,
        marginTop: 12,
        backgroundColor: depth % 2 === 0 ? '#fafafa' : '#f0f0f0',
        borderRadius: 4,
      }}
    >
      <p><strong>{comment.user_name}</strong></p>
      <p>{comment.content}</p>

      {/* כפתור תגובה */}
      <button
        onClick={() => onReply(comment.id)}
        style={{ fontSize: 12, color: 'blue', cursor: 'pointer', marginTop: 4 }}
      >
        Reply
      </button>

      {/* אם לחץ על תגובה זו, מציגים את טופס התגובה */}
      {replyTo === comment.id && (
        <AddCommentForm
          item_id={item_id}
          item_type={item_type}
          current_user_id={current_user_id}
          parent_id={comment.id}
          onSubmit={onSubmit}
          onCancelReply={() => onReply(null)}
        />
      )}

      {/* רקורסיה להצגת תגובות לילדים */}
      <CommentThread
        comments={comments}
        parent_id={comment.id}
        onReply={onReply}
        replyTo={replyTo}
        onSubmit={onSubmit}
        current_user_id={current_user_id}
        item_id={item_id}
        item_type={item_type}
        depth={depth + 1}
      />
    </div>
  ));
};

const CommentSection = ({ itemId, itemType = 'post', currentUserId }) => {
  const dispatch = useDispatch();
  const [replyTo, setReplyTo] = useState(null);

  const commentsSelector = useMemo(
    () => makeSelectCommentsByItem(itemType, itemId),
    [itemType, itemId]
  );

  const comments = useSelector(commentsSelector);

  useEffect(() => {
    dispatch(fetchCommentsByItem({ item_id: itemId, item_type: itemType }));
  }, [dispatch, itemId, itemType]);

  const handleSubmit = (commentData) => {
    dispatch(addComment(commentData));
    setReplyTo(null);
  };

  return (
    <div style={{ marginTop: 20, borderTop: '1px solid #ccc', paddingTop: 10, fontSize: 14 }}>
      <h3>Comments</h3>

      {comments.length === 0 && <p style={{ color: '#888' }}>No comments yet.</p>}

      <CommentThread
        comments={comments}
        onReply={setReplyTo}
        replyTo={replyTo}
        onSubmit={handleSubmit}
        current_user_id={currentUserId}
        item_id={itemId}
        item_type={itemType}
      />

      {/* טופס תגובה ראשית (כשלא מגיבים על תגובה ספציפית) */}
      {!replyTo && (
        <AddCommentForm
          item_id={itemId}
          item_type={itemType}
          current_user_id={currentUserId}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default CommentSection;
