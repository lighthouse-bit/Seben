// frontend/src/utils/imageUtils.js

export const getImageUrl = (image) => {
  // 1. Handle null/undefined
  if (!image) return 'https://via.placeholder.com/400x500?text=No+Image';

  // 2. Handle object vs string (backend might return { url: "..." } or just "...")
  const url = typeof image === 'object' ? image.url : image;

  // 3. Handle external URLs (e.g. Unsplash)
  if (url.startsWith('http')) return url;

  // 4. Handle Local Uploads
  // Remove '/api' from the VITE_API_URL (e.g., http://localhost:5000/api -> http://localhost:5000)
  const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
  
  // Ensure url starts with /
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  
  return `${baseUrl}${cleanPath}`;
};