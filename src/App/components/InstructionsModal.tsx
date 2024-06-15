// File: ./src/App/components/InstructionsModal.tsx

import React from "react";
import { Modal, Box, Typography, Button, Divider, Grid } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import PaletteIcon from "@mui/icons-material/Palette";

interface InstructionsModalProps {
  open: boolean;
  handleClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({
  open,
  handleClose,
}) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="instructions-modal-title"
      aria-describedby="instructions-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: "15px",
          border: "2px solid green",
          fontFamily: "'Comic Sans MS', cursive, sans-serif",
        }}
      >
        <Typography
          id="instructions-modal-title"
          variant="h4"
          component="h2"
          sx={{ textAlign: "center", color: "green", mb: 2 }}
        >
          📝 Instructions
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            color: "#333",
            mb: 3,
            fontStyle: "italic",
          }}
        >
          Welcome to the Ultimate Drafting Playground! 🎉 This app is designed
          to make your drafting process a breeze. Add nodes, connect them, and
          let your creativity flow effortlessly!
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Typography id="instructions-modal-description">
              <ul>
                <li>Click on "Add Node" to add a new node.</li>
                <li>Click on "Add Text Box" to add a new text box node.</li>
                <li>Click on "Add Container" to add a bounding box node.</li>
                <li>Click on "Add Database Node" to add a database node.</li>
                <li>Click on "Add People Node" to add a people node.</li>
                <li>
                  Use the toolbar at the bottom to save or load your mind map.
                </li>
                <li>Press "Delete" key to remove selected node or edge.</li>
              </ul>
            </Typography>
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid item xs={5}>
            <Typography>
              <ul>
                <li>
                  <FileCopyIcon /> Ctrl + C: Copy
                </li>
                <li>
                  <FileCopyIcon /> Ctrl + V: Paste
                </li>
                <li>
                  <PaletteIcon /> 1-9: Change Color
                </li>
              </ul>
            </Typography>
          </Grid>
        </Grid>
        <Button
          onClick={handleClose}
          sx={{
            mt: 2,
            bgcolor: "green",
            color: "white",
            "&:hover": {
              bgcolor: "orange",
            },
            borderRadius: "15px",
            fontWeight: "bold",
          }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default InstructionsModal;
