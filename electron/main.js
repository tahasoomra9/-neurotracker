// electron/main.js
import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    title: "NeuroTracker: AI Goal Achievement",
    frame: false, // Remove window frame and controls
    webPreferences: {
      // The preload script is the secure bridge between Node.js and the web content.
      preload: join(__dirname, "preload.js"),
      contextIsolation: true, // secure: isolate context
      nodeIntegration: false, // secure: disable Node in renderer
    },
  });

  // Remove the menu bar (File, Edit, View, etc.)
  mainWindow.removeMenu();

  // Load Vite dev server or built index.html
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, "../dist/index.html"));
  }
}

// Handle the IPC call from the renderer process to get the API key
ipcMain.handle("get-api-key", () => process.env.API_KEY);

// Window control handlers
ipcMain.handle("window-minimize", () => {
  console.log("Main: window-minimize called");
  if (mainWindow) {
    mainWindow.minimize();
    console.log("Main: window minimized");
  }
});

ipcMain.handle("window-maximize", () => {
  console.log("Main: window-maximize called");
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      console.log("Main: window unmaximized");
    } else {
      mainWindow.maximize();
      console.log("Main: window maximized");
    }
  }
});

ipcMain.handle("window-close", () => {
  console.log("Main: window-close called");
  if (mainWindow) {
    mainWindow.close();
    console.log("Main: window closed");
  }
});

ipcMain.handle("window-is-maximized", () => {
  console.log("Main: window-is-maximized called");
  const isMax = mainWindow ? mainWindow.isMaximized() : false;
  console.log("Main: isMaximized =", isMax);
  return isMax;
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
