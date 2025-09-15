declare global {
  interface Window {
    electronAPI?: {
      getApiKey: () => Promise<string>;
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      isMaximized: () => Promise<boolean>;
    };
  }
}

export {};