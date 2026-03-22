
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import "./styles/animations.css";
import "./dashboard.css";

createRoot(document.getElementById("root")!).render(<App />);
