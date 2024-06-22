import { useEffect } from "react";
import useStore from "../store";

const colors = [
  { color: "#ff6b6b", number: 1 },
  { color: "#f0e68c", number: 2 },
  { color: "#a1c084", number: 3 },
  { color: "#3498db", number: 4 },
  { color: "#8e44ad", number: 5 },
  { color: "#ffda79", number: 6 },
  { color: "#48c9b0", number: 7 },
  { color: "#e74c3c", number: 8 },
  { color: "#f6ad55", number: 9 },
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
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === "input") {
      // Don't change the color if the target is an input element
      return;
    }
    const colorObj = colors.find((c) => c.number === parseInt(event.key, 10));
    if (colorObj && selectedNodeId) {
      handleColorChange(colorObj.color);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectedNodeId]);

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        padding: "8px",
        backgroundColor: "rgb(239,239,239)",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "3px",
        border: "1px solid black",
        position: "relative",
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
              borderRadius: "12%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid gray",
            }}
          >
            {number}
          </div>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          right: "8px",
          bottom: "-5px",
          fontSize: " 10px",
        }}
      >
        Keyboard Shortcuts
      </div>
    </div>
  );
};

export default ColorPalette;
