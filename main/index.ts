/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) MNovus. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { app, BrowserWindow, ipcMain, Menu } from "electron";
import Store from "electron-store";
import path from "path";
import { Pty } from "./electron/pty";
import { RegisterMenu } from "./workers/menuWorker";
import { RegisterUpdateWorker } from "./workers/updateWorker";
import { RegisterFileWorker } from "./workers/fileWorker";
import { handleOpenSetFolder, open_folder } from "./workers/functionsWorker";
import { RegisterPythonWorker } from "./workers/pythonWorker";
import { RegisterStorageWorker } from "./workers/storageWorker";
import { RegisterIpcCommandsWorker } from "./workers/ipcMainCommandsWorker";
import { RegisterCommandOverlayWorker } from "./workers/commandOverlayWorker";
import { RegisterFileTreeWorker } from "./workers/fileTreeWorker";
import { notificationWorker } from "./workers/notificationWorker";
import {
  registerCommand,
  registerIpcMainCommand,
} from "./workers/commandWorker";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const TOOLS_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export const SELECTED_FOLDER_STORE_NAME = "selected-folder";

export const store = new Store();

RegisterIpcCommandsWorker({ store: store });
RegisterMenu({ store: store });
RegisterCommandOverlayWorker({ store: store });
RegisterFileTreeWorker({ store: store });
RegisterFileWorker();
RegisterPythonWorker();
RegisterStorageWorker();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

export let mainWindow: BrowserWindow;
let toolsWindow: BrowserWindow;
let dataStudio: BrowserWindow;
let cwd;

export const open_set_folder = async () => {
  handleOpenSetFolder({ store: store });
};

registerIpcMainCommand("datavarinfotitle-contextmenu", (event, data) => {
  const template: any = [
    { label: "Copy Name", click: () => {} },
    { type: "separator" },
    { label: "Copy Name", click: () => {} },
  ];

  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
});

ipcMain.handle("minimize", () => {
  mainWindow.minimize();
});

ipcMain.handle("close", () => {
  mainWindow.close();
});

ipcMain.handle("maximize", () => {
  mainWindow.maximize();
});

ipcMain.handle("restore", () => {
  mainWindow.restore();
});

console.log("dir name", __dirname);

const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    frame: false,
    title: "Meridia",
    icon: path.join(__dirname, "..", "..", "src", "assets/icon.ico"),
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      // nodeIntegration: true,
    },
    // zoomToPageWidth: true,
  });

  mainWindow.maximize();

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on("close", () => {
    registerCommand("handle-window-closing");
    notificationWorker.clearNotifications();
  });

  mainWindow.on("maximize", () => {
    registerCommand("window-changed-to-maximized");
  });

  mainWindow.on("unmaximize", () => {
    registerCommand("window-changed-to-restore");
  });

  try {
    // @ts-ignore
    cwd = store.get(SELECTED_FOLDER_STORE_NAME)?.root || "/";
  } catch {
    cwd = "";
  }

  Pty({ cwd: cwd, ipcMain: ipcMain });

  ipcMain.handle("open-folder", async (event, data) => {
    open_folder({ store: store });
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.webContents.openDevTools();
    mainWindow.show();
  });
};

const createToolsWindow = () => {
  if (!toolsWindow) {
    toolsWindow = new BrowserWindow({
      height: 800,
      width: 1200,
      show: false,
      icon: path.join(__dirname, "src", "assets", "icon.ico"),
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        // nodeIntegration: true,
      },
    });

    toolsWindow.loadURL(TOOLS_WINDOW_WEBPACK_ENTRY);

    toolsWindow.setMenuBarVisibility(false);

    toolsWindow.on("closed", () => {
      toolsWindow = null;
      mainWindow.webContents.send("tools-window-closed");
    });
  }
};

ipcMain.handle("show-tools", () => {
  createToolsWindow();

  if (toolsWindow && toolsWindow.isMinimized()) {
    toolsWindow.restore();
  }

  toolsWindow?.show();
});

ipcMain.handle("hide-tools", () => {
  if (toolsWindow) {
    toolsWindow.hide();
  }
});

const createDataStudioWindow = () => {
  if (!dataStudio) {
    dataStudio = new BrowserWindow({
      height: 800,
      width: 1200,
      show: false,
      frame: false,
      webPreferences: {
        // preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        // nodeIntegration: true,
      },
    });

    dataStudio.loadFile("./src/dataStudio.html");

    dataStudio.setMenuBarVisibility(false);

    dataStudio.on("closed", () => {
      dataStudio = null;
      mainWindow.webContents.send("datastudio-window-closed");
    });
  }
};

ipcMain.handle("show-datastudio", () => {
  createDataStudioWindow();

  if (dataStudio && dataStudio.isMinimized()) {
    dataStudio.restore();
  }

  dataStudio?.show();
});

ipcMain.handle("hide-datastudio", () => {
  if (dataStudio) {
    dataStudio.hide();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  createToolsWindow();
  RegisterUpdateWorker();
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
