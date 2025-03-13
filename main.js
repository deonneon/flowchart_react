const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// Determine if the app is running in development or production
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const appPath = isDev ? __dirname : process.resourcesPath;

// Enable these for debugging
// app.commandLine.appendSwitch('remote-debugging-port', '9222');
// app.commandLine.appendSwitch('disable-http-cache');

// Create error.html file at startup in a safe location
const errorHtmlPath = path.join(app.getPath('temp'), 'error.html');
const errorHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Error Loading App</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
    .error { background: #ffebee; border-left: 4px solid #f44336; padding: 10px; }
  </style>
</head>
<body>
  <h1>Error Loading Application</h1>
  <div class="error">
    <p>The application could not find the required files. This often happens when:</p>
    <ul>
      <li>The application wasn't built before launching</li>
      <li>The build directory structure is incorrect</li>
      <li>Path resolution issues between Vite and Electron</li>
    </ul>
    <p>Please contact support if this issue persists.</p>
  </div>
</body>
</html>
`;

// Write the error HTML file to a safe location
try {
  fs.writeFileSync(errorHtmlPath, errorHtml);
} catch (err) {
  console.error('Failed to create error.html:', err);
}

// Set up IPC handlers
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('get-app-path', () => app.getAppPath());

// Listen for preload ready event
ipcMain.on('preload-ready', () => {
  console.log('Preload script is ready');
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 1200,
    webPreferences: {
      nodeIntegration: false, // For security reasons
      contextIsolation: true, // Protect against prototype pollution
      preload: path.join(__dirname, 'preload.js'), // Use preload script
      devTools: true, // Always enable DevTools
    },
  });

  // Determine the correct path to index.html based on environment
  let indexPath;
  if (isDev) {
    indexPath = path.join(__dirname, "dist/index.html");
  } else {
    // In production, the path is different
    indexPath = path.join(process.resourcesPath, "app.asar/dist/index.html");
    
    // Fallback paths to try if the primary path doesn't exist
    const fallbackPaths = [
      path.join(process.resourcesPath, "app/dist/index.html"),
      path.join(__dirname, "dist/index.html"),
      path.join(app.getAppPath(), "dist/index.html")
    ];
    
    // Check if the primary path exists, if not try fallbacks
    if (!fs.existsSync(indexPath)) {
      console.log('Primary index.html path not found, trying fallbacks...');
      
      for (const fallbackPath of fallbackPaths) {
        console.log('Trying fallback path:', fallbackPath);
        if (fs.existsSync(fallbackPath)) {
          indexPath = fallbackPath;
          console.log('Found valid path:', indexPath);
          break;
        }
      }
    }
  }
  
  // Check if index.html exists
  const indexExists = fs.existsSync(indexPath);
  
  if (!indexExists) {
    console.error(`Error: Could not find ${indexPath}`);
    console.log('Current directory:', __dirname);
    console.log('App path:', app.getAppPath());
    console.log('Resources path:', process.resourcesPath);
    
    try {
      const dirs = [__dirname, app.getAppPath(), process.resourcesPath];
      dirs.forEach(dir => {
        try {
          console.log(`Contents of ${dir}:`, fs.readdirSync(dir));
        } catch (e) {
          console.log(`Could not read directory ${dir}:`, e.message);
        }
      });
    } catch (e) {
      console.error('Error listing directories:', e);
    }
    
    // Show an error page instead of silently failing
    win.loadFile(errorHtmlPath);
    return;
  }

  // Open DevTools in development mode
  if (isDev) {
    win.webContents.openDevTools();
  }

  // Load the production build
  win.loadFile(indexPath);
  
  // Handle load errors
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    win.loadFile(errorHtmlPath);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});