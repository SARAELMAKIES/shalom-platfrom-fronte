// // src/services/viewCounterService.js
// let mockViewCounts = {}; 

// export const getViewsCount = async (placeId) => {
//   await new Promise(resolve => setTimeout(resolve, 100)); 
//   console.log(`[Mock Service] Getting view count for ${placeId}: ${mockViewCounts[placeId] || 0}`);
//   return mockViewCounts[placeId] || 0;
// };

// export const incrementViewCount = async (placeId) => {
//   await new Promise(resolve => setTimeout(resolve, 100)); 
//   mockViewCounts[placeId] = (mockViewCounts[placeId] || 0) + 1;
//   console.log(`[Mock Service] Incremented view count for ${placeId} to: ${mockViewCounts[placeId]}`);
//   return mockViewCounts[placeId];
// };