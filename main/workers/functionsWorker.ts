import { dialog } from "electron";
import path from "path";
import { mainWindow, SELECTED_FOLDER_STORE_NAME } from "..";
import { get_files } from "../electron/get_files";
import { registerCommand } from "./commandWorker";
import { IFolderStructure } from "../../src/helpers/types";

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
      fileName: path.basename(filePaths[0]),
    });
  }
}

export async function handleOpenFolder({ store }: { store: any }) {
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

export function handleOpenRightPanel() {
  registerCommand("open-right-panel");
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

export function handleOpenCommandPalette() {
  registerCommand("open-command-palette");
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

export const open_folder = async ({ store }: { store: any }) => {
  const folder = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  let structure = undefined;
  if (!folder.canceled) {
    const children = get_files(folder.filePaths[0]);
    structure = {
      id: 1,
      name: folder.filePaths[0],
      root: folder.filePaths[0],
      type: "folder",
      children,
    };
    // @ts-ignore
    store.set(SELECTED_FOLDER_STORE_NAME, structure);
  }

  return structure;
};

export const set_folder = ({
  folder,
  store,
}: {
  folder: string;
  store: any;
}) => {
  let structure = undefined;

  try {
    const children = get_files(folder);
    structure = {
      id: 1,
      name: folder,
      root: folder,
      type: "folder",
      children,
    };

    // @ts-ignore
    store.set(SELECTED_FOLDER_STORE_NAME, structure);

    mainWindow.webContents.send("new-folder-opened", structure);
  } catch (error) {
    mainWindow.webContents.send("error-opening-folder", error.message);
  }
};

export const set_folder_structure = ({
  structure,
  store,
}: {
  structure: IFolderStructure;
  store: any;
}) => {
  // @ts-ignore
  store.set(SELECTED_FOLDER_STORE_NAME, structure);
};

export const refresh_window = ({
  folder,
  store,
}: {
  folder: string;
  store: any;
}) => {
  let structure = undefined;

  const children = get_files(folder);
  structure = {
    id: 0,
    name: folder,
    root: folder,
    type: "folder",
    children,
  };

  // @ts-ignore
  store.set(SELECTED_FOLDER_STORE_NAME, structure);
  mainWindow.webContents.send("new-folder-opened");
};
