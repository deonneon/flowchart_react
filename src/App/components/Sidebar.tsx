import { useState, useEffect } from "react";
import useStore from "../store";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface SavedDiagram {
  id: string;
  name: string;
  timestamp: number;
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
          timestamp: data.timestamp || 0
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

  return (
    <div 
      className="sidebar" 
      style={{ 
        width: isExpanded ? "200px" : "50px", 
        height: "100vh", 
        backgroundColor: "rgba(255, 255, 255, 0.5)", 
        borderRight: "1px solid #e0e0e0",
        transition: "width 0.3s ease",
        overflow: "hidden",
        position: "relative",
        zIndex: 10
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-header" style={{ 
        padding: "10px", 
        textAlign: isExpanded ? "left" : "center",
        whiteSpace: "nowrap"
      }}>
        {isExpanded ? (
          <h2>Flowchart</h2>
        ) : (
          <h2 style={{ fontSize: "20px" }}>≡</h2>
        )}
      </div>
      <div className="sidebar-content" style={{ 
        opacity: isExpanded ? 1 : 0,
        transition: "opacity 0.3s ease",
        visibility: isExpanded ? "visible" : "hidden",
        whiteSpace: "nowrap",
        overflowY: "auto",
        height: "calc(100vh - 60px)"
      }}>
        <div className="sidebar-item" style={{ padding: "0 10px" }}>
          <h3>Saved Diagrams</h3>
          {savedDiagrams.length > 0 ? (
            <ul style={{ 
              paddingLeft: "20px", 
              listStyleType: "none", 
              margin: 0 
            }}>
              {savedDiagrams.map((diagram) => (
                <li 
                  key={diagram.id} 
                  onClick={() => handleDiagramClick(diagram.id)}
                  style={{
                    padding: "8px 0",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div>{diagram.name}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      {new Date(diagram.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Button 
                    size="small" 
                    onClick={(e) => handleDeleteClick(e, diagram.id)}
                    style={{ minWidth: "30px", padding: "2px" }}
                  >
                    <DeleteIcon fontSize="small" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: "14px", color: "#888", padding: "0 0 0 5px" }}>
              No saved diagrams
            </p>
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


