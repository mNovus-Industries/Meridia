import fs from "fs";
import path from "path";

let idCounter = 0;

export const get_files = (dir: string) => {
  const buildStructure = (currentPath: string): any => {
    const currentFiles = fs.readdirSync(currentPath, { withFileTypes: true });

    return currentFiles.map((file): any => {
      const fullPath = path.join(currentPath, file.name);
      const id = `${++idCounter}`;

      if (file.isDirectory()) {
        return {
          id,
          name: file.name,
          type: "folder",
          path: fullPath,
          containingFolderPath: currentPath,
          children: buildStructure(fullPath),
        };
      } else {
        return {
          id,
          name: file.name,
          path: fullPath,
          containingFolderPath: currentPath,
          type: "file",
        };
      }
    });
  };

  console.log(dir);

  return buildStructure(dir);
};
