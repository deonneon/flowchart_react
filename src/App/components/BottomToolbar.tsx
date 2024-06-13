import { useEffect } from "react";
import { toast } from "react-toastify";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import GestureIcon from "@mui/icons-material/Gesture";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import useStore from "../store";
import ColorPalette from "./ColorPalette";
import PowerInputIcon from "@mui/icons-material/PowerInput";
import BorderStyleIcon from "@mui/icons-material/BorderStyle";

const BottomToolbar: React.FC = () => {
  const {
    edgePathType,
    selectedNodeId,
    nodes,
    updateBoundingBoxStyle,
    updateBoundingBoxRadius,
  } = useStore();

  const saveToJson = () => {
    const { nodes, edges } = useStore.getState();
    const dataToSave = { nodes, edges };
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mindmap.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleUploadJson = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          const { nodes, edges } = JSON.parse(text);
          useStore.setState({ nodes, edges });
        }
      };
      reader.readAsText(file);
    }
  };

  const saveToLocal = () => {
    const { nodes, edges } = useStore.getState();
    localStorage.setItem("reactFlowState", JSON.stringify({ nodes, edges }));
    toast("Saved current state!");
  };

  const loadFromLocal = () => {
    const data = localStorage.getItem("reactFlowState");
    if (data) {
      const { nodes, edges } = JSON.parse(data);
      useStore.setState({ nodes, edges });
      toast("Restored last saved state!");
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        saveToLocal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const inactiveStyle = { marginRight: "5px", padding: "10px" };
  const activeStyle = { backgroundColor: "#4CAF50", color: "white" };

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  const toggleBorderStyle = () => {
    if (selectedNode && selectedNode.type === "boundingbox") {
      const currentBorderStyle =
        selectedNode.style?.border || "1px solid black";
      const newBorderStyle =
        currentBorderStyle === "1px solid black"
          ? "1px dashed black"
          : "1px solid black";
      updateBoundingBoxStyle(selectedNodeId!, newBorderStyle);
    }
  };

  const toggleBorderRadius = () => {
    if (selectedNode && selectedNode.type === "boundingbox") {
      const currentBorderRadius = selectedNode.style?.borderRadius || "0px";
      const newBorderRadius = currentBorderRadius === "0px" ? "10px" : "0px";
      updateBoundingBoxRadius(selectedNodeId!, newBorderRadius);
    }
  };

  return (
    <div
      className="toolbar"
      style={{
        position: "absolute",
        bottom: 10,
        left: 50,
        zIndex: 100,
        display: "flex",
        gap: "10px",
        borderRadius: "3px",
      }}
    >
      <button onClick={saveToJson} title="Download as JSON">
        <DownloadIcon />
      </button>
      <button
        style={{
          cursor: "pointer",
          border: "1px solid gray",
          backgroundColor: "rgb(239, 239, 239)",
          padding: "1px 9px",
          borderRadius: "3px",
        }}
        title="Load JSON"
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <UploadFileIcon />
      </button>
      <input
        type="file"
        id="fileInput"
        style={{ display: "none" }}
        onChange={handleUploadJson}
        accept=".json"
      />
      <button onClick={saveToLocal} title="Save Mind Map">
        <SaveIcon />
      </button>
      <button onClick={loadFromLocal} title="Restore">
        <RestoreIcon />
      </button>
      <div
        style={{
          border: "1px solid gray",
          padding: "7px",
          backgroundColor: "rgb(239, 239, 239)",
          display: "flex",
          alignItems: "center",
          borderRadius: "3px",
        }}
      >
        <span style={{ marginRight: "5px" }}>Line Shape </span>
        <button
          style={
            edgePathType === "straight"
              ? { ...inactiveStyle, ...activeStyle }
              : inactiveStyle
          }
          onClick={() => useStore.setState({ edgePathType: "straight" })}
        >
          <HorizontalRuleIcon />
        </button>
        <button
          style={
            edgePathType === "bezier"
              ? { ...inactiveStyle, ...activeStyle }
              : inactiveStyle
          }
          onClick={() => useStore.setState({ edgePathType: "bezier" })}
        >
          <GestureIcon />
        </button>
        <button
          style={
            edgePathType === "smooth"
              ? { ...inactiveStyle, ...activeStyle }
              : inactiveStyle
          }
          onClick={() => useStore.setState({ edgePathType: "smooth" })}
        >
          <ShowChartIcon />
        </button>
      </div>
      <ColorPalette />
      {selectedNode && selectedNode.type === "boundingbox" && (
        <div
          style={{
            border: "1px solid gray",
            padding: "7px",
            backgroundColor: "rgb(239, 239, 239)",
            display: "flex",
            alignItems: "center",
            borderRadius: "3px",
          }}
        >
          <button
            onClick={toggleBorderStyle}
            title="Toggle Border Style"
            style={{ ...inactiveStyle }}
          >
            <PowerInputIcon />
          </button>
          <button
            onClick={toggleBorderRadius}
            style={{ ...inactiveStyle }}
            title="Toggle Border Radius"
          >
            <BorderStyleIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default BottomToolbar;
