// Environment configuration
// This file sets the backend URL based on the deployment environment

(function() {
  const isProduction = !window.location.hostname.includes('localhost');
  
  if (isProduction) {
    // Production: Use the backend Vercel URL
    // This should be injected as <meta> tag in index.html during build
    // OR set via Vercel environment variable injected into window by build script
    const metaBackendUrl = document.querySelector('meta[name="backend-url"]');
    window.__BACKEND_URL__ = metaBackendUrl ? metaBackendUrl.getAttribute('content') : 'https://ai-study-buddy-backend.vercel.app';
  } else {
    // Local development
    window.__BACKEND_URL__ = 'http://localhost:5173';
  }
  
  console.log('🔌 Backend URL:', window.__BACKEND_URL__);
})();
