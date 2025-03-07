import { mainWindow } from "..";

export function registerCommand(command: string) {
  mainWindow.webContents.send(command);
}
