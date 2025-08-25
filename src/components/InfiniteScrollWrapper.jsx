import React, { useRef, useEffect, useCallback } from 'react';

const InfiniteScrollWrapper = ({ loadMore, hasMore, isLoading, children }) => {
  const observer = useRef();

  const lastElementRef = useCallback(
    node => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting && hasMore) {
            console.log('InfiniteScrollWrapper: last element is intersecting (with rootMargin), calling loadMore immediately');
            loadMore();
          }
        },
        {
          root: null,
          rootMargin: '0px 0px 100px 0px', // Trigger 100px before the end
          threshold: 0.01,
        }
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadMore]
  );

  // קבלת כל הילדים
  const childrenArray = React.Children.toArray(children);

  return (
    <div className="space-y-4">
      {childrenArray}
      {/* רק אם יש עוד מה לטעון, נציג placeholder שיתפוס את ה-observer */}
      {hasMore && !isLoading && (
        <div ref={lastElementRef} style={{ minHeight: 1 }} />
      )}
      {/* No loading spinner for infinite scroll */}
    </div>
  );
};

export default InfiniteScrollWrapper;
