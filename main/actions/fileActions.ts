import path from "path";
import { get_files } from "../electron/get_files";
import fs from "fs";

export const delete_file = ({
  data,
  store,
}: {
  data: { path: string; rootPath: string };
  store: any;
}) => {
  if (!data.path) return;
  const folder = fs.rmSync(data.path);

  const children = get_files(data.rootPath);
  const structure = {
    id: 1,
    name: data.rootPath,
    root: data.rootPath,
    type: "folder",
    children,
  };

  // @ts-ignore
  store.set(SELECTED_FOLDER_STORE_NAME, structure);
};

export const delete_folder = ({
  data,
  store,
}: {
  data: { path: string; rootPath: string };
  store: any;
}) => {
  if (!data.path) return;

  // Delete folder and contents recursively
  fs.rmSync(data.path, { recursive: true, force: true });

  // Rebuild file structure
  const children = get_files(data.rootPath);
  const structure = {
    id: 1,
    name: data.rootPath,
    root: data.rootPath,
    type: "folder",
    children,
  };

  // @ts-ignore
  store.set(SELECTED_FOLDER_STORE_NAME, structure);
};

export const create_folder = ({
  data,
  store,
}: {
  data: { path: string; rootPath: string; fileName: string };
  store: any;
}) => {
  const new_folder = fs.mkdirSync(path.join(data.path, data.fileName));

  const children = get_files(data.rootPath);
  const structure = {
    id: 1,
    name: data.rootPath,
    root: data.rootPath,
    type: "folder",
    children,
  };

  // @ts-ignore
  store.set(SELECTED_FOLDER_STORE_NAME, structure);

  const newFolder = {
    name: data.fileName,
    parentPath: data.path,
    path: data.path,
    is_dir: true,
  };
};

export const create_file = ({
  data,
  store,
}: {
  data: { path: string; rootPath: string; fileName: string };
  store: any;
}) => {
  const new_file = fs.writeFileSync(path.join(data.path, data.fileName), "");

  const children = get_files(data.rootPath);
  const structure = {
    id: 1,
    name: data.rootPath,
    root: data.rootPath,
    type: "folder",
    children,
  };

  // @ts-ignore
  store.set(SELECTED_FOLDER_STORE_NAME, structure);
};

export const handle_rename = (
  event: any,
  data: {
    newName: string;
    path: string;
    containingFolder: string;
    rootPath: string;
  },
  store: any
) => {
  const node = fs.renameSync(
    data.path,
    path.join(data.containingFolder, data.newName)
  );

  const children = get_files(data.rootPath);
  const structure = {
    id: 1,
    name: data.rootPath,
    root: data.rootPath,
    type: "folder",
    children,
  };

  // @ts-ignore
  store.set(SELECTED_FOLDER_STORE_NAME, structure);
};
