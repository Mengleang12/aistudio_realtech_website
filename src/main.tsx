import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Automatically clean up unwanted token query params from URL address bar (e.g. ?token= or ?access_token=)
try {
  if (typeof window !== "undefined" && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    if (params.has("token") || params.has("access_token")) {
      params.delete("token");
      params.delete("access_token");
      const cleanSearch = params.toString() ? `?${params.toString()}` : "";
      const cleanUrl = window.location.pathname + cleanSearch + window.location.hash;
      window.history.replaceState(null, document.title, cleanUrl);
    }
  }
} catch {
  // ignore
}

createRoot(document.getElementById("root")!).render(<App />);
