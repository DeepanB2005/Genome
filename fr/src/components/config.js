// config.js
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export const API_BASE_URL = isDev
  ? "http://localhost:8000"                      // 👈 Local backend
  : "https://genome-ytvz.onrender.com";          // 👈 Deployed backend
