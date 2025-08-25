// export default AddCommentForm;
import React, { useState, useEffect } from 'react';

const AddCommentForm = ({
  item_id,
  item_type,
  current_user_id,
  parent_id = null,
  onSubmit,
  onCancelReply,
}) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    setContent('');
  }, [parent_id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit({
      item_id,
      item_type,
      user_id: current_user_id,
      content,
      parent_id,
    });

    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
      {parent_id && (
        <div style={{ marginBottom: 5, color: 'blue', fontSize: 12 }}>
          Replying to comment #{parent_id}
          {onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              style={{
                marginLeft: 8,
                color: 'red',
                cursor: 'pointer',
                border: 'none',
                background: 'none',
              }}
              title="Cancel reply"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <textarea
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment..."
        style={{
          width: '100%',
          padding: 8,
          fontSize: 14,
          borderRadius: 4,
          borderColor: '#ccc',
        }}
        required
      />

      <button
        type="submit"
        disabled={!content.trim()}
        style={{
          marginTop: 5,
          padding: '6px 12px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          opacity: content.trim() ? 1 : 0.5,
        }}
      >
        Submit
      </button>
    </form>
  );
};

export default AddCommentForm;
