import { ipcMain } from "electron";
import {
  handleNewFile,
  handleOpenFile,
  handleOpenFolder,
  handleSaveCurrentFile,
  handleOpenSettings,
  handleOpenMeridiaStudio,
  handleOpenSidebar,
  handleOpenRightPanel,
  handleOpenBottomPanel,
  handleOpenOutput,
  handleOpenTerminal,
  handleRun,
} from "./functionsWorker";

export function RegisterCommandOverlayWorker({ store }: { store: any }) {
  ipcMain.on("execute-command", (_, commandId) => {
    switch (commandId) {
      case "new":
        handleNewFile();
        break;
      case "open":
        handleOpenFile();
        break;
      case "open-folder":
        handleOpenFolder({ store: store });
        break;
      case "save":
        handleSaveCurrentFile();
        break;
      case "settings":
        handleOpenSettings();
        break;
      case "meridia-studio":
        handleOpenMeridiaStudio();
        break;
      case "toggle-sidebar":
        handleOpenSidebar();
        break;
      case "toggle-right-panel":
        handleOpenRightPanel();
        break;
      case "toggle-bottom-panel":
        handleOpenBottomPanel();
        break;
      case "open-output":
        handleOpenOutput();
        break;
      case "open-terminal":
        handleOpenTerminal();
        break;
      case "run":
        handleRun();
        break;
      default:
        console.warn(`Unknown command: ${commandId}`);
    }
  });
}
