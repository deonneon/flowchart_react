import React, { useState } from "react";
import { Button } from "@mui/material";
import { Node } from "reactflow";
import useStore from "../store";

type DiagramType = "mindmap" | "flow";

interface DiagramTypeSwitcherProps {
  nodes: Node[];
  setCenter: (x: number, y: number) => void;
}

const DiagramTypeSwitcher: React.FC<DiagramTypeSwitcherProps> = ({
  nodes,
  setCenter,
}) => {
  const { setDiagramType, diagramType } = useStore();
  const [activeType, setActiveType] = useState<DiagramType>(diagramType);

  const handleSetDiagramType = (type: DiagramType) => {
    setDiagramType(type);
    setActiveType(type);
  };

  return (
    <div
      style={{ position: "absolute", top: "10px", right: "10px", zIndex: 999 }}
    >
      <div>
        <Button
          style={{
            backgroundColor: activeType === "mindmap" ? "#FFA500" : "lightgray",
            color: "white",
            border: "0px",
            padding: "10px 20px",
            borderRight: "none",
            borderRadius: "0px",
            cursor: "pointer",
          }}
          onClick={() => handleSetDiagramType("mindmap")}
        >
          Mind Map
        </Button>
        <Button
          style={{
            backgroundColor: activeType === "flow" ? "#FFA500" : "lightgray",
            color: "white",
            padding: "10px 20px",
            border: "0px",
            borderRadius: "0px",
            cursor: "pointer",
          }}
          onClick={() => handleSetDiagramType("flow")}
        >
          Flow Diagram
        </Button>
      </div>
      {/* <div style={{ color: "gray", textAlign: "right", fontSize: "10px" }}>
        EZ Mapper by Danh
      </div> */}
    </div>
  );
};

export default DiagramTypeSwitcher;
