import fs from "fs";
import { registerIpcMainCommand } from "./commandWorker";
import { mainWindow, open_set_folder, SELECTED_FOLDER_STORE_NAME } from "..";
import {
  create_file,
  create_folder,
  delete_file,
  delete_folder,
  handle_rename,
} from "../actions/fileActions";
import { get_file_content } from "../electron/functions";
import {
  refresh_window,
  set_folder,
  set_folder_structure,
} from "./functionsWorker";
import { IFolderStructure } from "../../src/helpers/types";

export function RegisterIpcCommandsWorker({ store }: { store: any }) {
  registerIpcMainCommand("get-folder", async () =>
    store.get(SELECTED_FOLDER_STORE_NAME)
  );

  registerIpcMainCommand("clear-folder", () =>
    store.delete(SELECTED_FOLDER_STORE_NAME)
  );

  registerIpcMainCommand("set-folder", (_event, folder: string) =>
    set_folder({ folder: folder, store: store })
  );

  registerIpcMainCommand("create-folder", (_event, data) =>
    fs.mkdirSync(data.path)
  );

  registerIpcMainCommand("open-set-folder", () => open_set_folder());

  registerIpcMainCommand("refresh-window", (_event, folder) =>
    refresh_window({ folder: folder, store: store })
  );

  registerIpcMainCommand("create-folder", (_event, data) =>
    create_folder({ data, store })
  );

  registerIpcMainCommand("delete-folder", (_event, data) =>
    delete_folder({ data, store })
  );

  registerIpcMainCommand("create-file", (_event, data) =>
    create_file({ data, store })
  );

  registerIpcMainCommand("delete-file", (_event, data) =>
    delete_file({ data, store })
  );

  registerIpcMainCommand("rename", (event, data) =>
    handle_rename(event, data, store)
  );

  registerIpcMainCommand("get-file-content", async (_event, path) =>
    get_file_content({ path })
  );

  registerIpcMainCommand("save-file", (_event, data) =>
    fs.writeFileSync(data.path, data.content)
  );

  registerIpcMainCommand("send-tools-data", (_event, data) => {
    mainWindow.webContents.send("update-tools-data", data);
  });

  registerIpcMainCommand(
    "set-folder-structure",
    (_event, structure: IFolderStructure) =>
      set_folder_structure({ store: store, structure: structure })
  );
}
