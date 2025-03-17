import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Switch,
} from "@mui/material";

export interface MenuModalProps {
  open: boolean;
  onClose: () => void;
  showShadowNodes: boolean;
  toggleShowShadowNodes: () => void;
  showGrid: boolean;
  setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;
}

const MenuModal: React.FC<MenuModalProps> = ({
  open,
  onClose,
  showShadowNodes,
  toggleShowShadowNodes,
  showGrid,
  setShowGrid,
}) => {
  const handleShowGridToggle = () => {
    setShowGrid(!showGrid);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>Flowchart Instructions</DialogTitle>
      <DialogContent>
        <div style={{ maxWidth: "600px" }}>
          <h3>Basic Controls</h3>
          <ul>
            <li>Click and drag to move the canvas</li>
            <li>Scroll to zoom in/out</li>
            <li>Click on a node to select it</li>
            <li>Drag from a node to create a connection</li>
            <li>Press Delete to remove a selected node</li>
            <li>Ctrl+C to copy a node, Ctrl+V to paste</li>
          </ul>

          <h3>Node Types</h3>
          <ul>
            <li>
              <strong>Standard Node:</strong> Basic node for flowcharts and
              mindmaps
            </li>
            <li>
              <strong>Text Box:</strong> For adding notes and descriptions
            </li>
            <li>
              <strong>Bounding Box:</strong> Container to group related nodes
            </li>
            <li>
              <strong>Database:</strong> Represents a database in system diagrams
            </li>
            <li>
              <strong>Person:</strong> Represents a person or role in
              organizational charts
            </li>
          </ul>

          <h3>Saving & Exporting</h3>
          <ul>
            <li>
              <strong>Save:</strong> Saves your diagram to browser storage
            </li>
            <li>
              <strong>Export as Image:</strong> Downloads the diagram as a PNG
              image
            </li>
            <li>
              <strong>Download JSON:</strong> Exports the diagram data as a JSON
              file
            </li>
            <li>
              <strong>Upload JSON:</strong> Imports a previously exported diagram
            </li>
          </ul>

          <h3>Advanced Features</h3>
          <FormControlLabel
            control={
              <Switch
                checked={showShadowNodes}
                onChange={toggleShowShadowNodes}
              />
            }
            label="Show Shadow Nodes (for quick node creation)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showGrid}
                onChange={handleShowGridToggle}
              />
            }
            label="Show Grid"
          />
          <p>
            <small>
              When shadow nodes are enabled, they appear when you hover over existing
              nodes, allowing for quick creation of connected nodes.
            </small>
          </p>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MenuModal;
