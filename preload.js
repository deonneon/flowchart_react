// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    // Add any functions you want to expose here
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    // Add more methods as needed
  }
);

// Log when preload script has loaded
console.log('Preload script loaded successfully');

// Handle uncaught exceptions in the renderer process
window.addEventListener('error', (event) => {
  console.error('Uncaught exception in renderer process:', event.error);
});

// Notify main process that preload is ready
ipcRenderer.send('preload-ready'); 