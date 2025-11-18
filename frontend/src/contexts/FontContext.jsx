import { createContext, useEffect, useState } from "react";

export const FontSizeContext = createContext({ fontSize: 16, setFontSize: () => {} });

export function FontSizeProvider({ children }) {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem("fontSize");
    return saved ? Number(saved) : 16; // base px
  });

  useEffect(() => {
    // Scale all Tailwind rem sizes (e.g., text-2xl)
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem("fontSize", String(fontSize));
  }, [fontSize]);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}