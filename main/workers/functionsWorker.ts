import { dialog } from "electron";
import { mainWindow, SELECTED_FOLDER_STORE_NAME } from "..";
import { get_files } from "../electron/get_files";
import { registerCommand } from "./commandWorker";

export function handleNewFile() {
  registerCommand("new-file-tab");
}

export async function handleOpenFile() {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
  });

  if (!canceled && filePaths.length) {
    mainWindow.webContents.send("new-file-opened", {
      path: filePaths[0],
      fileName: filePaths[0].split("/").pop(),
    });
  }
}

export async function handleOpenFolder(store: any) {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });

  if (!canceled && filePaths.length) {
    const structure = {
      id: 1,
      name: filePaths[0],
      root: filePaths[0],
      type: "folder",
      children: get_files(filePaths[0]),
    };

    // @ts-ignore
    store.set(SELECTED_FOLDER_STORE_NAME, structure);
    registerCommand("new-folder-opened");
  }
}

export function handleSaveCurrentFile() {
  registerCommand("save-current-file");
}

export function handleOpenSettings() {
  registerCommand("open-settings");
}

export function handleOpenMeridiaStudio() {
  registerCommand("open-meridia-studio");
}

export function handleOpenSidebar() {
  registerCommand("open-sidebar");
}

export function handleOpenBottomPanel() {
  registerCommand("open-bottom-panel");
}

export function handleOpenOutput() {
  registerCommand("open-output");
}

export function handleOpenTerminal() {
  registerCommand("open-terminal");
}

export function handleRun() {
  registerCommand("run-current-file");
}

export async function handleOpenSetFolder({ store }: { store: any }) {
  const folder = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  let structure = undefined;
  if (!folder.canceled) {
    const children = get_files(folder.filePaths[0]);
    structure = {
      id: 0,
      name: folder.filePaths[0],
      root: folder.filePaths[0],
      type: "folder",
      children,
    };
    // @ts-ignore
    store.set(SELECTED_FOLDER_STORE_NAME, structure);
    mainWindow.webContents.send("new-folder-opened");
  }
}
