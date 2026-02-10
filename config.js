// Environment configuration
// This file sets the backend URL based on the deployment environment

(function() {
  // For Vercel deployment
  const isProduction = !window.location.hostname.includes('localhost');
  
  if (isProduction) {
    // Set this to your deployed backend URL
    // Example: https://ai-study-buddy-backend.vercel.app
    window.__BACKEND_URL__ = process.env.REACT_APP_BACKEND_URL || 'https://your-backend-url.vercel.app';
  } else {
    // Local development
    window.__BACKEND_URL__ = 'http://localhost:5173';
  }
  
  console.log('Backend URL:', window.__BACKEND_URL__);
})();
