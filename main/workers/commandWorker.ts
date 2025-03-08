import { ipcMain } from "electron";
import { mainWindow } from "..";

export function registerCommand(command: string) {
  mainWindow.webContents.send(command);
}

export function registerIpcMainCommand(
  command: string,
  handler: (...args: any[]) => any
) {
  if (typeof handler === "function") {
    if (
      command.startsWith("get-") ||
      command.startsWith("run-") ||
      command.startsWith("open-")
    ) {
      ipcMain.handle(command, async (event, ...args) =>
        handler(event, ...args)
      );
    } else {
      ipcMain.on(command, (event, ...args) => handler(event, ...args));
    }
  } else {
    console.error(`Handler for command "${command}" is not a function.`);
  }
}
