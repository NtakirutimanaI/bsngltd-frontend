
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import "./styles/animations.css";
import "./dashboard.css";

// Handle chunk load errors globally
window.addEventListener('error', (e) => {
  if (e.message?.includes('Failed to fetch dynamically imported module') || e.message?.includes('chunk-load-error')) {
    window.location.reload();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
