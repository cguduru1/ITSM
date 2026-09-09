// src/main.jsx
// Apply theme before React loads
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext"; // Use the correct single-source context

import "./chartSetup";
import "./styles.css";

const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === "string" && args[0].includes("Support for defaultProps")) {
    return;
  }
  originalError(...args);
};

// Apply theme before React mounts
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
} else {
  document.body.classList.remove("dark-mode");
}

// const root = createRoot(document.getElementById("root"));

// 2. Mount React Application
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
