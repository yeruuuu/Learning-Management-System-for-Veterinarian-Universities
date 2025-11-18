import { useContext } from "react";
import { FontSizeContext } from "../contexts/FontContext";

export default function FontSizeSlider({ isVisible }) {
  const { fontSize, setFontSize } = useContext(FontSizeContext);

  return (
    <>
      {/* Font Size Slider - Only show when isVisible is true */}
      {isVisible && (
        <div
          style={{
            position: "fixed",
            top: 15,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "#d37014ff",
            padding: "8px",
            borderRadius: "8px"
          }}
        >
          <label>
            Font Size: {fontSize}px
            <input
              type="range"
              min={12}
              max={36}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              style={{ marginLeft: "10px" }}
            />
          </label>
        </div>
      )}
    </>
  );
}
