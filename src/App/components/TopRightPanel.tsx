import React, { useState } from "react";
import { Button, Tooltip, Badge } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DownloadButton from "./DownloadButton";
import MenuModal from "./MenuModal";
import useStore from "../store";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import AddBoxIcon from "@mui/icons-material/AddBox";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import StorageIcon from "@mui/icons-material/Storage";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";

export interface TopRightPanelProps {
  showGrid: boolean;
  setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;
  showCheckpoints?: boolean;
  toggleCheckpoints?: () => void;
}

const TopRightPanel: React.FC<TopRightPanelProps> = ({ 
  showGrid, 
  setShowGrid, 
  showCheckpoints = true, 
  toggleCheckpoints 
}) => {
  const {
    diagramType,
    addEmptyNode,
    addEmptyTextNode,
    addBoundingBoxNode,
    addDatabaseNode,
    addPeopleNode,
  } = useStore((state) => ({
    diagramType: state.diagramType,
    addEmptyNode: state.addEmptyNode,
    addEmptyTextNode: state.addEmptyTextNode,
    addBoundingBoxNode: state.addBoundingBoxNode,
    addDatabaseNode: state.addDatabaseNode,
    addPeopleNode: state.addPeopleNode,
  }));

  const [isModalOpen, setModalOpen] = useState(false);
  const showShadowNodes = useStore((state) => state.showShadowNodes);
  const toggleShowShadowNodes = useStore(
    (state) => state.toggleShowShadowNodes
  );

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const buttonStyle = {
    marginLeft: "5px",
    minWidth: "40px",
    padding: "6px 8px",
    position: "relative" as const
  };
  
  const plusIconStyle = {
    position: "absolute" as const,
    bottom: -1,
    right: -1,
    backgroundColor: "green",
    borderRadius: "50%",
    width: "14px",
    height: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    color: "white",
    boxShadow: "0px 1px 2px rgba(0,0,0,0.3)"
  };

  // Component for add button with plus indicator
  const AddButton = ({ icon, onClick, tooltip }: { icon: React.ReactNode, onClick: () => void, tooltip: string }) => (
    <Tooltip title={tooltip}>
      <Button style={buttonStyle} variant="contained" onClick={onClick}>
        {icon}
        <div style={plusIconStyle}>
          <AddIcon style={{ fontSize: "10px" }} />
        </div>
      </Button>
    </Tooltip>
  );

  return (
    <div>
      <Tooltip title="Show Instructions">
        <Button
          onClick={handleOpenModal}
          style={{ marginRight: "5px" }}
          variant="outlined"
        >
          <MenuIcon />
        </Button>
      </Tooltip>
      
      <DownloadButton />
      
      <AddButton 
        icon={<AddBoxIcon />} 
        onClick={addEmptyNode} 
        tooltip="Add Node" 
      />
      
      <AddButton 
        icon={<TextFieldsIcon />} 
        onClick={addEmptyTextNode} 
        tooltip="Add Text Box" 
      />
      
      {diagramType === "flow" && (
        <>
          <AddButton 
            icon={<AccountTreeIcon />} 
            onClick={addBoundingBoxNode} 
            tooltip="Add Container" 
          />
          
          <AddButton 
            icon={<StorageIcon />} 
            onClick={addDatabaseNode} 
            tooltip="Add Database" 
          />
          
          <AddButton 
            icon={<PersonIcon />} 
            onClick={addPeopleNode} 
            tooltip="Add Person" 
          />
        </>
      )}
      
      {toggleCheckpoints && (
        <Tooltip title={showCheckpoints ? "Hide Checkpoints" : "Show Checkpoints"}>
          <Button
            style={buttonStyle}
            variant="contained"
            onClick={toggleCheckpoints}
          >
            {showCheckpoints ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            Review Checkpoints
          </Button>
        </Tooltip>
      )}
      
      <MenuModal
        open={isModalOpen}
        onClose={handleCloseModal}
        showShadowNodes={showShadowNodes}
        toggleShowShadowNodes={toggleShowShadowNodes}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
      />
    </div>
  );
};

export default TopRightPanel;
