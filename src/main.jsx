import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import {
  SavedListingsProvider,
} from "./context/SavedListingsContext";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SavedListingsProvider>
          <App />
        </SavedListingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);