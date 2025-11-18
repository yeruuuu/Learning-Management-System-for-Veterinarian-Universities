import { createContext, useState } from "react";

const VIEW_KEY = "view";

export const ViewContext = createContext();

export function ViewProvider({ children }) {
  const [view, _setView] = useState(() => {
    try {
      return localStorage.getItem(VIEW_KEY) || "grid";
    } catch (e) {
      return "grid";
    }
  });

  const setView = (newView) => {
    try {
      localStorage.setItem(VIEW_KEY, newView);
    } catch (e) {
      // ignore
    }
    _setView(newView);
  };

  return (
    <ViewContext.Provider value={{ view, setView }}>
      {children}
    </ViewContext.Provider>
  );
}

export default ViewProvider;
