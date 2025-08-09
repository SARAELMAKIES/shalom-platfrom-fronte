
import axios from 'axios';
import postsApi from './postsApi';
import locationsApi from './locationsApi';

const BASE_URL = 'http://localhost:3001/api';

// --- פונקציות טיוטות ---

export const fetchUserDrafts = async (userId) => {
  const response = await axios.get(`${BASE_URL}/user/${userId}/drafts`);
  const sortedDrafts = response.data.sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at);
    const dateB = new Date(b.updated_at || b.created_at);
    return dateB - dateA;
  });
  return sortedDrafts;
};

export const getDraftById = (id) => {
  return axios.get(`${BASE_URL}/drafts/${id}`);
};

export const saveDraft = (payload) => {
  return axios.post(`${BASE_URL}/drafts`, payload);
};

export const deleteDraft = async (draftId) => {
  await axios.delete(`${BASE_URL}/drafts/${draftId}`);
};

export const publishDraft = async (draft, userId) => {
  let publishedItem;

  const formData = new FormData();
  formData.append('user_id', userId);

  if (draft.data.images && draft.data.images.length > 0) {
    formData.append('existing_images', JSON.stringify(draft.data.images));
  }

  if (draft.type === 'post') {
    formData.append('title', draft.data.title || '');
    formData.append('content', draft.data.content || '');
    formData.append('location_id', draft.data.location_id || '');
    formData.append('category_id', draft.data.category_id || '');
    formData.append('created_at', new Date().toISOString());

publishedItem = await postsApi.createPost(formData);
  } else if (draft.type === 'location') {
    formData.append('name', draft.data.name || '');
    formData.append('description', draft.data.description || '');
    formData.append('category_id', draft.data.category_id || '');
    formData.append('lat', draft.data.lat || '');
    formData.append('lng', draft.data.lng || '');
    formData.append('city', draft.data.city || '');
    formData.append('area', draft.data.area || '');
    formData.append('country', draft.data.country || '');
    formData.append('restaurantType', draft.data.restaurantType || '');
    formData.append('kosherAuthority', draft.data.kosherAuthority || '');
    formData.append('kosherAuthorityOther', draft.data.kosherAuthorityOther || '');
    formData.append('customCategoryName', draft.data.customCategoryName || '');

    publishedItem = await locationsApi.addLocation(formData);
  } else {
    throw new Error('סוג טיוטה לא נתמך לפרסום.');
  }

  await deleteDraft(draft.id);
  return publishedItem;
};

// יצוא אובייקט כולל לכל הפונקציות שקשורות לטיוטות
const draftsApi = {
  fetchUserDrafts,
  getDraftById,
  saveDraft,
  deleteDraft,
  publishDraft,
};

export default draftsApi;
