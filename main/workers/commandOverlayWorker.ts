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

const commandHandlers: any = {
  new: handleNewFile,
  open: handleOpenFile,
  "open-folder": (store: any) => handleOpenFolder({ store }),
  save: handleSaveCurrentFile,
  settings: handleOpenSettings,
  "meridia-studio": handleOpenMeridiaStudio,
  "toggle-sidebar": handleOpenSidebar,
  "toggle-right-panel": handleOpenRightPanel,
  "toggle-bottom-panel": handleOpenBottomPanel,
  "open-output": handleOpenOutput,
  "open-terminal": handleOpenTerminal,
  run: handleRun,
};

export function RegisterCommandOverlayWorker({ store }: {store: any}) {
  ipcMain.on("execute-command", (_, commandId) => {
    const handler = commandHandlers[commandId];
    if (handler) {
      handler(store);
    } else {
      console.warn(`Unknown command: ${commandId}`);
    }
  });
}
