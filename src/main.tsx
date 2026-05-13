import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./utils/registerSW";
import { AppProvider } from "./context/AppContext";
import { isAppTheme, THEME_KEY } from "./lib/settings";

// Register Service Worker for PWA
registerServiceWorker();

const storedTheme = localStorage.getItem(THEME_KEY);
const initialTheme = isAppTheme(storedTheme) ? storedTheme : 'dark';
document.documentElement.dataset.theme = initialTheme;
document.documentElement.style.colorScheme = initialTheme;

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <App />
  </AppProvider>
);
