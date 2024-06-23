import { useState } from "react";
import { Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DownloadButton from "./DownloadButton";
import MenuModal from "./MenuModal";
import useStore from "../store";

interface TopRightPanelProps {
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
}

const TopRightPanel = ({ showGrid, setShowGrid }: TopRightPanelProps) => {
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

  return (
    <div>
      <Button
        onClick={handleOpenModal}
        title="Show Instructions"
        style={{ marginRight: "5px" }}
        variant="outlined"
      >
        <MenuIcon />
      </Button>
      <DownloadButton />
      <Button
        style={{ marginLeft: "5px" }}
        variant="contained"
        onClick={addEmptyNode}
        title="Add Empty Node"
      >
        Add Node
      </Button>
      <Button
        style={{ marginLeft: "5px" }}
        variant="contained"
        onClick={addEmptyTextNode}
        title="Add Text Box"
      >
        Add Text
      </Button>
      {diagramType === "flow" && (
        <>
          <Button
            style={{ marginLeft: "5px" }}
            variant="contained"
            onClick={addBoundingBoxNode}
            title="Add Bounding Box"
          >
            Add Container
          </Button>
          <Button
            style={{ marginLeft: "5px" }}
            variant="contained"
            onClick={addDatabaseNode}
            title="Add Database Node"
          >
            Add Database
          </Button>
          <Button
            style={{ marginLeft: "5px" }}
            variant="contained"
            onClick={addPeopleNode}
            title="Add People Node"
          >
            Add Person
          </Button>
        </>
      )}
      <MenuModal
        open={isModalOpen}
        handleClose={handleCloseModal}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showShadowNodes={showShadowNodes}
        toggleShowShadowNodes={toggleShowShadowNodes}
      />
    </div>
  );
};

export default TopRightPanel;
