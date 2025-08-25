// Utility to build a comment tree from a flat array (ported from PlaceDetail)
export function buildCommentTree(flatComments) {
  const commentsById = {};
  const rootComments = [];

  flatComments.forEach(comment => {
    commentsById[comment.id] = { ...comment, replies: [] };
  });

  flatComments.forEach(comment => {
    if (comment.parent_id && commentsById[comment.parent_id]) {
      commentsById[comment.parent_id].replies.push(commentsById[comment.id]);
    } else if (!comment.parent_id && comment.item_type === 'post') {
      rootComments.push(commentsById[comment.id]);
    }
  });

  // Optionally sort replies by date descending
  Object.values(commentsById).forEach(comment => {
    comment.replies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  });

  return rootComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
