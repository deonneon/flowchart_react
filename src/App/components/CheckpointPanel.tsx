import { useState, useEffect } from "react";
import useStore, { Checkpoint } from "../store";
import { Button, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import CircularProgress from "@mui/material/CircularProgress";
import "./CheckpointPanel.css";

const CheckpointPanel = () => {
  const { checkpoints, loadCheckpoint, deleteCheckpoint } = useStore();
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  
  // Load checkpoints from localStorage on component mount
  useEffect(() => {
    const loadCheckpointsFromStorage = () => {
      const checkpointKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('flowchart_checkpoint_')
      );
      
      if (checkpointKeys.length > 0 && checkpoints.length === 0) {
        // Only load if we have checkpoints in storage but none in state
        const loadedCheckpoints: Checkpoint[] = checkpointKeys.map(key => {
          const id = key.replace('flowchart_checkpoint_', '');
          
          // Try to load preview from storage
          let preview: string | undefined;
          let name = `Checkpoint ${id.substring(0, 4)}`;
          let timestamp = Date.now();
          
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const parsed = JSON.parse(data);
              preview = parsed.preview;
              
              // If the checkpoint has a name stored, use it
              if (parsed.name) {
                name = parsed.name;
              }
              
              // If the checkpoint has a timestamp stored, use it
              if (parsed.timestamp) {
                timestamp = parsed.timestamp;
              }
            }
          } catch (e) {
            console.error("Error loading checkpoint preview:", e);
          }
          
          return {
            id,
            name,
            timestamp,
            preview
          };
        });
        
        // Sort by most recent first and update state
        loadedCheckpoints.sort((a, b) => b.timestamp - a.timestamp);
        useStore.setState({ checkpoints: loadedCheckpoints });
      }
    };
    
    loadCheckpointsFromStorage();
  }, [checkpoints.length]);
  
  // Handle image loading states
  useEffect(() => {
    // Initialize loading state for all checkpoints
    const newLoadingState: Record<string, boolean> = {};
    checkpoints.forEach(checkpoint => {
      if (checkpoint.preview) {
        newLoadingState[checkpoint.id] = true;
      }
    });
    setLoadingImages(newLoadingState);
  }, [checkpoints]);
  
  const handleImageLoad = (checkpointId: string) => {
    setLoadingImages(prev => ({
      ...prev,
      [checkpointId]: false
    }));
  };
  
  const handleImageError = (checkpointId: string) => {
    setLoadingImages(prev => ({
      ...prev,
      [checkpointId]: false
    }));
    console.error(`Failed to load preview for checkpoint ${checkpointId}`);
  };

  
  const clearAllCheckpoints = () => {
    // Delete all checkpoints from localStorage
    checkpoints.forEach(checkpoint => {
      localStorage.removeItem(`flowchart_checkpoint_${checkpoint.id}`);
    });
    
    // Clear checkpoints from state
    useStore.setState({ checkpoints: [] });
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="checkpoint-panel">
      <div className="panel-header">
        <h3 className="checkpoint-title">Checkpoints</h3>
        <div className="panel-actions">
          {checkpoints.length > 0 && (
            <Button 
              variant="outlined"
              size="small"
              color="error"
              onClick={clearAllCheckpoints}
              aria-label="Clear all checkpoints"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && clearAllCheckpoints()}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
      
      <div className="panel-content">
        {checkpoints.length > 0 ? (
          checkpoints.map((checkpoint) => (
            <div 
              key={checkpoint.id}
              className="checkpoint-card"
            >
              {/* Preview Image */}
              <div 
                className="preview-container"
                onClick={() => loadCheckpoint(checkpoint.id)}
              >
                {checkpoint.preview ? (
                  <>
                    {loadingImages[checkpoint.id] && (
                      <div className="preview-loading">
                        <CircularProgress size={24} />
                      </div>
                    )}
                    <img 
                      src={checkpoint.preview} 
                      alt={`Checkpoint from ${formatDate(checkpoint.timestamp)}`}
                      className="preview-image"
                      onLoad={() => handleImageLoad(checkpoint.id)}
                      onError={() => handleImageError(checkpoint.id)}
                      style={{ 
                        opacity: loadingImages[checkpoint.id] ? 0 : 1,
                        transition: 'opacity 0.3s ease'
                      }}
                    />
                  </>
                ) : (
                  <div className="preview-placeholder">
                    <ImageIcon style={{ fontSize: 40 }} />
                    <span style={{ fontSize: "12px", marginTop: "5px" }}>No preview</span>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="preview-overlay">
                  Click to Restore
                </div>
              </div>
              
              <div className="checkpoint-footer">
                <div className="checkpoint-date">
                  {formatDate(checkpoint.timestamp)}
                </div>
                <div className="checkpoint-actions">
                  <Tooltip title="Delete checkpoint">
                    <Button 
                      size="small" 
                      onClick={() => deleteCheckpoint(checkpoint.id)}
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
            No checkpoints yet. Create one to save your progress.
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckpointPanel; 