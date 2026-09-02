const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";

const API_URL = isLocalhost
  ? "http://localhost:5050"
  : (process.env.NEXT_PUBLIC_API_URL || "https://rihab-backend.onrender.com");

export default API_URL;
