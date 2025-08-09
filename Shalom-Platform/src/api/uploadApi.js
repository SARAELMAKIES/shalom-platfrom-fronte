import axios from 'axios';
const BASE_URL = 'http://localhost:3001/api';

export const uploadTempImages = (formData) => {
  return axios.post(`${BASE_URL}/upload-temp-images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
