import React, { useEffect } from "react";
import useStore from "../store";

const colors = [
  { color: "yellow", number: 1 },
  { color: "red", number: 2 },
  { color: "green", number: 3 },
  { color: "blue", number: 4 },
  { color: "orange", number: 5 },
  { color: "purple", number: 6 },
  { color: "pink", number: 7 },
  { color: "brown", number: 8 },
];

const ColorPalette = () => {
  const updateNodeColor = useStore((state) => state.updateNodeColor);
  const selectedNodeId = useStore((state) => state.selectedNodeId);

  const handleColorChange = (color: string) => {
    if (selectedNodeId) {
      updateNodeColor(selectedNodeId, color);
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    const colorObj = colors.find((c) => c.number === parseInt(event.key, 10));
    if (colorObj) {
      handleColorChange(colorObj.color);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        padding: "2px",
        backgroundColor: "rgb(239,239,239)",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "2px",
        border: "1px solid black",
      }}
    >
      {colors.map(({ color, number }) => (
        <div
          key={color}
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            onClick={() => handleColorChange(color)}
            style={{
              backgroundColor: color,
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              cursor: "pointer",
              marginBottom: "2px",
            }}
          ></div>
          <div
            style={{
              fontSize: "12px",
              border: "1px solid black",
              borderRadius: "5px",
              backgroundColor: "white",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              userSelect: "none",
              pointerEvents: selectedNodeId ? "auto" : "none",
              color: selectedNodeId ? "black" : "white",
            }}
          >
            {number}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ColorPalette;
