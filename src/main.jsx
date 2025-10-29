import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));
root.render(<App />);

// Make sure **no service worker** is registered
// (Leave this commented out or remove the file entirely if you had one)
// serviceWorkerRegistration.register();
