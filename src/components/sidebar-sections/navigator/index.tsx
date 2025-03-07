import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import { MainContext, path_join } from "../../../shared/functions";
import {
  update_active_file,
  update_active_files,
} from "../../../shared/rdx-slice";
import { IFolderStructure, TActiveFile } from "../../../shared/types";
import { store } from "../../../shared/store";
import useTree from "../../../shared/hooks/useTree";
import FileTree from "./fileTree";

const Navigator = React.memo((props: any) => {
  const folder_structure = useAppSelector(
    (state) => state.main.folder_structure
  );

  const dispatch = useAppDispatch();

  const useMainContextIn = React.useContext(MainContext);

  const active_files = useAppSelector((state) => state.main.active_files);

  const [fileTreeData, setFileTree] = React.useState<IFolderStructure | null>(
    folder_structure
  );

  useEffect(() => {
    if (!folder_structure || Object.keys(folder_structure).length === 0) {
      console.warn(
        "Folder structure is empty, initializing default structure."
      );
    } else {
      console.log("found folder", folder_structure);
      setFileTree(sortFolderStructure(folder_structure));
    }
  }, [folder_structure]);

  const { insertNode, deleteNode, updateNode } = useTree();

  const handle_set_editor = React.useCallback(
    async (branch_name: string, full_path: string) => {
      console.log("branch", branch_name, full_path);
      const get_file_content =
        await window.electron.get_file_content(full_path);
      const active_file: TActiveFile = {
        icon: "",
        path: full_path,
        name: branch_name,
        is_touched: false,
        content: get_file_content,
      };

      const selected_file = {
        name: branch_name,
        path: full_path,
        content: get_file_content,
      };

      if (
        store
          .getState()
          .main.active_files.findIndex((file) => file.path == full_path) == -1
      ) {
        store.dispatch(
          update_active_files([
            ...store.getState().main.active_files,
            active_file,
          ])
        );
      }

      dispatch(update_active_file(active_file));

      setTimeout(() => {
        useMainContextIn.handle_set_editor(selected_file);
      }, 0);
    },
    [active_files]
  );

  useEffect(() => {
    window.electron.ipcRenderer.on("new-file-tab", () => {
      console.log("new file");
      const randomFilePath = `/untitled.py`;
      handle_set_editor("Untitled.py", randomFilePath);
    });

    window.electron.ipcRenderer.on(
      "new-file-opened",
      (e: any, data: { path: string; fileName: string }) => {
        console.log("open file", data);
        handle_set_editor(data.fileName, data.path);
      }
    );
  }, []);

  useEffect(() => {
    if (
      !fileTreeData ||
      (Array.isArray(fileTreeData) && fileTreeData.length === 0)
    ) {
      const newFolder: any = {
        id: Date.now(),
        type: "folder",
        name: "welcome",
        children: [],
      };
      setFileTree(newFolder);
    }
  }, [fileTreeData]);

  const handleRename = (
    id: any,
    newName: any,
    path: string,
    containingFolder: string
  ) => {
    setFileTree(sortFolderStructure(updateNode(fileTreeData, id, newName)));

    window.electron.rename({
      newName: newName,
      path: path,
      rootPath: fileTreeData.root,
      containingFolder: containingFolder,
    });

    dispatch(
      update_active_files(
        active_files.map((tab) =>
          tab.path === path ? { ...tab, name: newName } : tab
        )
      )
    );
  };

  const handleDelete = (id: any, type: string, path: string) => {
    const updatedTree = deleteNode(fileTreeData, id);
    setFileTree(sortFolderStructure(updatedTree));

    if (type === "folder") {
      window.electron.delete_folder({
        path: path,
        rootPath: fileTreeData.root,
      });
    } else {
      window.electron.delete_file({
        path: path,
        rootPath: fileTreeData.root,
      });
    }

    // dispatch(
    //   update_active_files(active_files.filter((tab) => tab.path !== path))
    // );
  };

  const handleAddFile = (
    parentId: any,
    fileName: any,
    path: string,
    containingFolder: string
  ) => {
    const newFile = {
      id: Date.now(),
      type: "file",
      name: fileName,
      path: path_join([path, fileName]),
      containingFolderPath: containingFolder,
    };

    const fileExists = fileTreeData.children.some(
      (child) =>
        path_join([child.path, child.name]) === path_join([path, fileName])
    );

    if (fileExists) {
      window.electron.ipcRenderer.send("show-warning", {
        title: "File Already Exists",
        message: `Warning: A file with the name "${fileName}" already exists in this directory.`,
      });
      return;
    }

    setFileTree(
      sortFolderStructure(insertNode(fileTreeData, parentId, newFile))
    );

    window.electron.create_file({
      path: path,
      fileName: fileName,
      rootPath: fileTreeData.root,
    });
  };

  const handleAddFolder = (
    parentId: any,
    folderName: any,
    path: string,
    contaningFolder: string
  ) => {
    const newFolder: any = {
      id: Date.now(),
      type: "folder",
      name: folderName,
      path: path_join([path, folderName]),
      containingFolderPath: contaningFolder,
      children: [],
    };

    setFileTree(
      sortFolderStructure(insertNode(fileTreeData, parentId, newFolder))
    );
    window.electron.create_folder({
      path: path,
      fileName: folderName,
      rootPath: fileTreeData.root,
    });
  };

  const sortFolderStructure: any = (folder_structure: any) => {
    if (!folder_structure.children) return folder_structure;

    return {
      ...folder_structure,
      children: [...folder_structure.children]
        .sort((a: any, b: any) => {
          if (a.type === "folder" && b.type !== "folder") return -1;
          if (a.type !== "folder" && b.type === "folder") return 1;
          return a.name.localeCompare(b.name);
        })
        .map((child: any) =>
          child.type === "folder" ? sortFolderStructure(child) : child
        ),
    };
  };

  return (
    <div className="folder-tree">
      <div className="explorer-content-wrapper">
        <div className="content-list-outer-container">
          <div></div>
          <FileTree
            handleDelete={handleDelete}
            handleAddFile={handleAddFile}
            handleAddFolder={handleAddFolder}
            handleRename={handleRename}
            fileTree={fileTreeData}
            onFileClick={handle_set_editor}
          />
        </div>
      </div>
    </div>
  );
});

export default Navigator;
