import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));
root.render(<App />);

// Ensure NO service worker is registered
// (Leave it commented or remove the file entirely if you had one)
// serviceWorkerRegistration.register();
