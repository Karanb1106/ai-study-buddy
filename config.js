// Environment configuration

(function () {
  const isLocal =
    window.location.hostname.includes("localhost") ||
    window.location.hostname.includes("127.0.0.1");

  if (isLocal) {
    // 🔧 Local development
    window.__BACKEND_URL__ = "http://localhost:5173";
  } else {
    // 🚀 Production (Vercel)
    const metaBackendUrl = document.querySelector(
      'meta[name="backend-url"]'
    );

    window.__BACKEND_URL__ = metaBackendUrl
      ? metaBackendUrl.getAttribute("content")
      : "https://ai-study-buddy-backend-7k9m2p5j.vercel.app";
  }

  console.log("🔌 Backend URL:", window.__BACKEND_URL__);
})();
