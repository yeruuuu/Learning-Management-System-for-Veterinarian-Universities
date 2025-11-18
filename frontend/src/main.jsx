import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import { RoleProvider } from "./contexts/RoleContext.jsx";
import { ViewProvider } from "./contexts/ViewContext.jsx";
import { FontSizeProvider } from "./contexts/FontContext.jsx";

import ReactDom from "react-dom/client";

ReactDom.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FontSizeProvider>
      <RoleProvider>
        <ViewProvider>
          <BrowserRouter>
            <App />
            <Toaster />
          </BrowserRouter>
        </ViewProvider>
      </RoleProvider>
    </FontSizeProvider>
  </StrictMode>
);
