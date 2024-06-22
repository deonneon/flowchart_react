import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import PaletteIcon from "@mui/icons-material/Palette";

interface MenuModalProps {
  open: boolean;
  handleClose: () => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showShadowNodes: boolean;
  toggleShowShadowNodes: () => void;
}

const MenuModal: React.FC<MenuModalProps> = ({
  open,
  handleClose,
  showGrid,
  setShowGrid,
  showShadowNodes,
  toggleShowShadowNodes,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [defaultNodeColor, setDefaultNodeColor] = useState("#3498db");

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const applyDarkMode = (enabled: boolean) => {
    if (enabled) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    applyDarkMode(!darkMode);
  };

  const handleShowGridToggle = () => {
    setShowGrid(!showGrid);
  };

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
          height: 500,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: "15px",
          border: "2px solid green",
          display: "flex",
          fontFamily: "'Comic Sans MS', cursive, sans-serif",
        }}
      >
        <Box sx={{ borderRight: 1, borderColor: "divider", pr: 2 }}>
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Menu tabs"
          >
            <Tab label="Instructions" />
            <Tab label="Settings" />
          </Tabs>
        </Box>
        <Box sx={{ flexGrow: 1, pl: 2, overflowY: "auto" }}>
          {activeTab === 0 && (
            <Box sx={{ height: "100%", overflowY: "auto" }}>
              <Typography
                variant="body1"
                sx={{
                  textAlign: "center",
                  color: "#333",
                  mb: 3,
                  fontStyle: "italic",
                  padding: "10px",
                }}
              >
                Welcome to the Ultimate Drafting Playground! 🎉 This app is
                designed to make your drafting process a breeze. Add nodes,
                connect them, and let your creativity flow effortlessly!
              </Typography>
              <Stack>
                <Box>
                  <FileCopyIcon fontSize="small" /> Ctrl + C: Copy
                </Box>
                <Box>
                  <FileCopyIcon fontSize="small" /> Ctrl + V: Paste
                </Box>
                <Box>
                  <PaletteIcon fontSize="small" /> Ctrl + S: Save
                </Box>
                <Box>
                  <PaletteIcon fontSize="small" /> 1-9: Change Color
                </Box>
              </Stack>
            </Box>
          )}
          {activeTab === 1 && (
            <Box sx={{ height: "100%", overflowY: "auto" }}>
              <Typography
                variant="body1"
                sx={{
                  textAlign: "center",
                  color: "#333",
                  mb: 3,
                  fontStyle: "italic",
                }}
              >
                Customize your drafting experience here. Set defaults and
                customize!
              </Typography>
              {/* <FormControlLabel
                control={
                  <Switch checked={darkMode} onChange={handleDarkModeToggle} />
                }
                label="Dark Mode"
              /> */}
              <FormControlLabel
                control={
                  <Switch checked={showGrid} onChange={handleShowGridToggle} />
                }
                label="Show Grid"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showShadowNodes}
                    onChange={toggleShowShadowNodes}
                  />
                }
                label="Enable Shadow Node Assist"
              />
            </Box>
          )}
        </Box>
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
            alignSelf: "center",
            position: "absolute",
            right: 20,
            bottom: 15,
          }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default MenuModal;
