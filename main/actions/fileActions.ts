import path from "path";
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
};

export const delete_folder = ({
  data,
  store,
}: {
  data: { path: string; rootPath: string };
  store: any;
}) => {
  if (!data.path) return;

  fs.rmSync(data.path, { recursive: true, force: true });
};
export const create_folder = ({
  data,
  store,
}: {
  data: { path: string; rootPath: string; fileName: string };
  store: any;
}) => {
  if (!fs.existsSync(data.path)) {
    fs.mkdirSync(data.path, { recursive: true });
  }
};

export const create_file = ({
  data,
  store,
}: {
  data: { path: string; rootPath: string; fileName: string };
  store: any;
}) => {
  if (!fs.existsSync(data.path)) {
    fs.writeFileSync(data.path, "");
  }
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
};
