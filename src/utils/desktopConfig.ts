import { Platform } from 'react-native';

// Desktop-specific utilities and configurations
export const isDesktop = Platform.OS === 'web' && typeof window !== 'undefined' && window.electronAPI;

export const desktopConfig = {
  // File system operations
  saveWorkflow: async (workflowData: any) => {
    if (isDesktop) {
      // Use Electron API to save file
      window.electronAPI.sendMessage('save-workflow', workflowData);
    }
  },

  loadWorkflow: async () => {
    if (isDesktop) {
      // Use Electron API to load file
      window.electronAPI.sendMessage('load-workflow');
    }
  },

  // Window management
  minimize: () => {
    if (isDesktop) {
      // Send minimize command to Electron
    }
  },

  maximize: () => {
    if (isDesktop) {
      // Send maximize command to Electron
    }
  },

  close: () => {
    if (isDesktop) {
      // Send close command to Electron
    }
  },

  // Platform info
  platform: isDesktop ? window.electronAPI.platform : Platform.OS,

  // Keyboard shortcuts
  shortcuts: {
    newWorkflow: isDesktop ? 'CmdOrCtrl+N' : 'N',
    save: isDesktop ? 'CmdOrCtrl+S' : 'S',
    open: isDesktop ? 'CmdOrCtrl+O' : 'O',
  },

  // Desktop-specific features
  features: {
    nativeMenus: isDesktop,
    systemTray: isDesktop,
    autoUpdates: isDesktop,
    fileAssociations: isDesktop,
  },
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    electronAPI: {
      sendMessage: (channel: string, data?: any) => void;
      onMessage: (channel: string, func: (...args: any[]) => void) => void;
      platform: string;
      versions: {
        node: string;
        chrome: string;
        electron: string;
      };
    };
  }
}