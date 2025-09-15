// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload script loaded");

// Expose a secure API to the renderer process (your React app)
contextBridge.exposeInMainWorld("electronAPI", {
  // Securely fetch API key
  getApiKey: () => ipcRenderer.invoke("get-api-key"),

  // Custom window controls
  minimizeWindow: () => {
    console.log("Preload: minimizeWindow called");
    return ipcRenderer.invoke("window-minimize");
  },
  maximizeWindow: () => {
    console.log("Preload: maximizeWindow called");
    return ipcRenderer.invoke("window-maximize");
  },
  closeWindow: () => {
    console.log("Preload: closeWindow called");
    return ipcRenderer.invoke("window-close");
  },
  isMaximized: () => {
    console.log("Preload: isMaximized called");
    return ipcRenderer.invoke("window-is-maximized");
  },
});

console.log("electronAPI exposed to window");

// Add a simple test to verify preload is working
window.preloadTest = "Preload script is working!";
console.log("Added preloadTest to window");
