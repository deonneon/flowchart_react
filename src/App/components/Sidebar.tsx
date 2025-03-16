import { useState, useEffect } from "react";
import useStore from "../store";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import "./CheckpointPanel.css"; // Import the shared styles

interface SavedDiagram {
  id: string;
  name: string;
  timestamp: number;
  preview?: string; // Optional preview image
  data?: any; // The actual diagram data
}

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedDiagrams, setSavedDiagrams] = useState<SavedDiagram[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diagramToDelete, setDiagramToDelete] = useState<string | null>(null);
  const { loadSavedDiagram, deleteSavedDiagram } = useStore();
  
  const handleMouseEnter = () => {
    setIsExpanded(true);
  };
  
  const handleMouseLeave = () => {
    setIsExpanded(false);
  };

  useEffect(() => {
    // Load saved diagrams from localStorage
    const loadSavedDiagrams = () => {
      const savedKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('flowchart_diagram_')
      );
      
      const diagrams = savedKeys.map(key => {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        return {
          id: key,
          name: data.name || key.replace('flowchart_diagram_', ''),
          timestamp: data.timestamp || 0,
          preview: data.preview || undefined,
          data: data
        };
      });
      
      // Sort by most recent first
      diagrams.sort((a, b) => b.timestamp - a.timestamp);
      setSavedDiagrams(diagrams);
    };
    
    loadSavedDiagrams();
    
    // Set up event listener for storage changes
    window.addEventListener('storage', loadSavedDiagrams);
    
    // Custom event for when diagrams are saved
    window.addEventListener('diagramSaved', loadSavedDiagrams);
    
    return () => {
      window.removeEventListener('storage', loadSavedDiagrams);
      window.removeEventListener('diagramSaved', loadSavedDiagrams);
    };
  }, []);

  const handleDiagramClick = (diagramId: string) => {
    loadSavedDiagram(diagramId);
  };
  
  const handleDeleteClick = (e: React.MouseEvent, diagramId: string) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setDiagramToDelete(diagramId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (diagramToDelete) {
      deleteSavedDiagram(diagramToDelete);
      setDeleteDialogOpen(false);
      setDiagramToDelete(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUploadJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          try {
            const { nodes, edges } = JSON.parse(text);
            useStore.setState({ nodes, edges });
          } catch (error) {
            console.error("Error parsing JSON file:", error);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const saveToJson = (diagram: SavedDiagram) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    if (diagram.data) {
      const dataToSave = { 
        nodes: diagram.data.nodes || [], 
        edges: diagram.data.edges || [] 
      };
      
      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
        type: "application/json",
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${diagram.name || 'flowchart'}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div 
      className="sidebar" 
      style={{ 
        width: isExpanded ? "300px" : "30px", 
        marginTop: "70px",
        height: isExpanded ? "100vh" : "30vh", 
        backgroundColor: "rgba(255, 255, 255, 0.5)", 
        borderRight: "1px solid #e0e0e0",
        boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
        borderRadius: "0 5px 5px 0",
        transition: "width 0.3s ease",
        overflow: "hidden",
        position: "relative",
        zIndex: 10
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-content" style={{ 
        opacity: isExpanded ? 1 : 0,
        transition: "opacity 0.3s ease",
        visibility: isExpanded ? "visible" : "hidden",
        whiteSpace: "nowrap",
        overflowY: "auto",
        height: "calc(100vh - 60px)",
        padding: "10px"
      }}>
        <div className="panel-header" style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="checkpoint-title">Saved Diagrams</h3>
        </div>
        
        <Button 
          variant="contained"
          startIcon={<UploadFileIcon />}
          onClick={() => document.getElementById("sidebarFileInput")?.click()}
          fullWidth
          style={{ marginBottom: "15px" }}
        >
          Load from Computer
        </Button>
        <input
          type="file"
          id="sidebarFileInput"
          onChange={handleUploadJson}
          accept=".json"
          style={{ display: "none" }}
        />
        
        <div className="panel-content">
          {savedDiagrams.length > 0 ? (
            savedDiagrams.map((diagram) => (
              <div 
                key={diagram.id} 
                className="checkpoint-card"
              >
                {/* Preview Image */}
                <div 
                  className="preview-container"
                  onClick={() => handleDiagramClick(diagram.id)}
                >
                  {diagram.preview ? (
                    <img 
                      src={diagram.preview} 
                      alt={`Diagram: ${diagram.name}`}
                      className="preview-image"
                    />
                  ) : (
                    <div className="preview-placeholder">
                      <ImageIcon style={{ fontSize: 40 }} />
                      <span style={{ fontSize: "12px", marginTop: "5px" }}>No preview</span>
                    </div>
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="preview-overlay">
                    Click to Load
                  </div>
                </div>
                
                <div className="checkpoint-footer">
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "14px" }}>{diagram.name}</div>
                    <div className="checkpoint-date">
                      {formatDate(diagram.timestamp)}
                    </div>
                  </div>
                  <div className="checkpoint-actions">
                    <Tooltip title="Save to file">
                      <Button 
                        size="small" 
                        onClick={saveToJson(diagram)}
                      >
                        <DownloadIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                    <Tooltip title="Delete diagram">
                      <Button 
                        size="small" 
                        onClick={(e) => handleDeleteClick(e, diagram.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              No saved diagrams yet.
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Diagram</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this diagram? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Sidebar;


