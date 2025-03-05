import React, { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import { MainContext } from "../../../shared/functions";

import {
  set_folder_structure,
  update_active_file,
  update_active_files,
} from "../../../shared/rdx-slice";
import {
  IFolderStructure,
  TActiveFile,
  TFolderTree,
} from "../../../shared/types";

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

  const [fileTreeData, setFileTree] = React.useState(folder_structure);

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

      // dispatch(set_selected_file(selected_file))
      setTimeout(() => {
        useMainContextIn.handle_set_editor(selected_file);
      }, 0);
    },
    [active_files]
  );

  useEffect(() => {
    window.electron.ipcRenderer.on("new-file-tab", () => {
      console.log("new file");
      const randomFilePath = `/untitled-${Date.now()}.py`;
      handle_set_editor("Untitled.py", randomFilePath);
    });

    window.electron.ipcRenderer.on(
      "new-file-opened",
      (data: { fileName: string; filePath: string }) => {
        console.log("open file", data);
        handle_set_editor(data.fileName, data.filePath);
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

  const handleRename = (id: any, newName: any) => {
    setFileTree(updateNode(fileTreeData, id, newName));
    // setActiveEditorTabs(activeEditorTabs.map((tab) => (tab.id === id ? { ...tab, name: newName } : tab)));
  };

  const handleDelete = (id: any) => {
    const updatedTree = deleteNode(fileTreeData, id);
    setFileTree(updatedTree);
    // setActiveEditorTabs(activeEditorTabs.filter((tab) => tab.id !== id));
  };

  const handleAddFile = (parentId: any, fileName: any) => {
    const newFile = {
      id: Date.now(),
      type: "file",
      name: fileName,
      data: "// Start typing your code here",
    };

    setFileTree(insertNode(fileTreeData, parentId, newFile));
    // setActiveEditorTabs([...activeEditorTabs, { id: newFile.id, name: newFile.name, data: newFile.data }]);
    // setSelectedTabId(newFile.id);
  };

  const handleAddFolder = (parentId: any, folderName: any) => {
    const newFolder: any = {
      id: Date.now(),
      type: "folder",
      name: folderName,
      children: [],
    };

    setFileTree(insertNode(fileTreeData, parentId, newFolder));
  };

  useEffect(() => {
    setFileTree(folder_structure); // Type assertion
  }, [folder_structure]);

  return (
    <div className="folder-tree">
      <div className="explorer-content-wrapper">
        <div className="content-list-outer-container">
          <div>{/* <span>Navigator</span> */}</div>
          {/* <Folder
            handleInsertNode={handleInsertNode}
            handleRemoveNode={handleRemoveNode}
            explorer={folder_structure || undefined}
          /> */}
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
