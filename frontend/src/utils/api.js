const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? "https://rihab-backend.onrender.com"
    : (process.env.NODE_ENV === 'production' ? "https://rihab-backend.onrender.com" : "http://localhost:5050"));

export default API_URL;
