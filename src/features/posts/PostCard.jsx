
import React from 'react';
import ItemCard from '../../components/ItemCard';

const PostCard = ({ post, handlers }) => {
  return (
    <ItemCard
      title={post.title}
      itemId={`${post.id}_post`}
      description={post.content}
      images={post.images}
      userName={post.user_name}
      userId={post.user_id}
      createdAt={post.created_at}
      commentsCount={post.comment_count}
      views={post.views}
      itemType="post"
      currentUserId={handlers?.currentUserId || 1}
      category={post.category_name || post.category || post.category_id || 'Not provided'}
      location={post.location || post.location_id || 'Not provided'}
      itemUrl={`/posts/${post.id}`}
      onLike={handlers?.onLike}
      onComment={handlers?.onComment}
      onReport={handlers?.onReport}
      onShare={handlers?.onShare}
    />
  );
};

export default PostCard;
