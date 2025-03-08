import { ChevronRightIcon } from "@primer/octicons-react";
import { useState, useEffect, useRef } from "react";
import FileIcon from "../../../helpers/file-icon";

import "./style.css";

function FileTree({
  fileTree,
  handleAddFile,
  handleAddFolder,
  handleDelete,
  handleRename,
  onFileClick,
}: {
  fileTree: any;
  handleAddFile: ({}, {}, {}, {}) => void;
  handleAddFolder: ({}, {}, {}, {}) => void;
  handleDelete: ({}, {}, {}) => void;
  handleRename: ({}, {}, {}, {}) => void;
  onFileClick: ({}, {}) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(fileTree.name === fileTree.root);
  const [showOptions, setShowOptions] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState({
    isFolder: false,
    showInput: false,
    folderId: null,
  });
  const [isRenaming, setIsRenaming]: any = useState({
    showInput: false,
    name: "",
    newName: "",
    id: null,
  });
  const inputRef = useRef(null);
  const buttonRef = useRef(null);

  const handleRenameSubmit = () => {
    if (
      isRenaming.id &&
      isRenaming.newName &&
      isRenaming.name !== isRenaming.newName &&
      isRenaming.newName.trim() !== ""
    ) {
      handleRename(
        isRenaming.id,
        isRenaming.newName,
        fileTree.path,
        fileTree.root === fileTree.name
          ? fileTree.root
          : fileTree.containingFolderPath
      );
    }
    setIsRenaming({
      showInput: false,
      name: "",
      newName: "",
      id: null,
    });
  };

  useEffect(() => {
    if (isRenaming.showInput && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming.showInput]);

  const handleKebabClick = (e: any) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  const handleSubmission = (e: any, path: string, contaningFolder: string) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const name: any = form.get("name");

    if (name.trim() === "") return;

    if (isCreating.isFolder) {
      handleAddFolder(isCreating.folderId, name, path, contaningFolder);
    } else {
      handleAddFile(isCreating.folderId, name, path, contaningFolder);
    }

    e.target.reset();
    setIsCreating({ ...isCreating, showInput: false });
  };

  const handleDropdownItemClick = (
    action: any,
    fileTreeId: any,
    fileTreeName: any
  ) => {
    switch (action) {
      case "newFile":
        setIsExpanded(true);
        setIsCreating({
          isFolder: false,
          showInput: true,
          folderId: fileTreeId,
        });
        break;
      case "newFolder":
        setIsExpanded(true);
        setIsCreating({
          isFolder: true,
          showInput: true,
          folderId: fileTreeId,
        });
        break;
      case "rename":
        setIsRenaming({ showInput: true, id: fileTreeId, name: fileTreeName });
        break;
      case "delete":
        handleDelete(fileTree.id, fileTree.type, fileTree.path);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    console.log("tree", fileTree);
  }, []);

  useEffect(() => {
    console.log(
      "Children of",
      fileTree.name,
      ":",
      fileTree.children,
      "type",
      fileTree.type
    );
  }, []);

  if (fileTree.type === "folder") {
    return (
      <>
        <div
          onMouseOver={() => setShowOptions(true)}
          onMouseLeave={() => setShowOptions(false)}
          className="relative text-xs flex select-none cursor-pointer items-center justify-between gap-6 py-1 px-2 pr-1 text-neutral-400 rounded hover:bg-neutral-400/20 hover:text-neutral-200"
          onAuxClick={handleKebabClick}
        >
          <div
            className="flex items-center gap-1.5 flex-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span
              className={`${isExpanded ? "rotate-90" : ""} flex items-center text-base`}
            >
              <ChevronRightIcon size={15} />
            </span>
            <span
              className="-mt-[0.5px] text-base"
              style={{ fontSize: "14px" }}
            >
              {isRenaming.showInput && isRenaming.id === fileTree.id ? (
                <input
                  ref={inputRef}
                  className="w-full h-full border-0 bg-black outline-0 px-0 py-1 text-base"
                  defaultValue={
                    fileTree.root === fileTree.name
                      ? fileTree?.name?.split(/\/|\\/).at(-1)
                      : fileTree.name
                  }
                  onChange={(e) =>
                    setIsRenaming({ ...isRenaming, newName: e.target.value })
                  }
                  onBlur={() => {
                    handleRenameSubmit();
                    setIsRenaming({ showInput: false, id: null });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRenameSubmit();
                    }
                  }}
                  style={{ fontSize: "14px" }}
                />
              ) : fileTree.root === fileTree.name ? (
                fileTree?.name?.split(/\/|\\/).at(-1)
              ) : (
                fileTree.name
              )}
            </span>
          </div>
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={handleKebabClick}
              className={`p-1 rounded flex items-center justify-center hover:bg-neutral-400/50 hover:text-neutral-200 focus:bg-neutral-400/50 focus:text-neutral-200 text-base ${
                showOptions || isDropdownOpen ? "visible" : "invisible"
              }`}
            >
              ...
            </button>
            <DropdownMenu
              isOpen={isDropdownOpen}
              fileTreeId={fileTree.id}
              fileTreeName={fileTree.name}
              fileTreeRoot={fileTree.root}
              onClose={handleDropdownClose}
              type="folder"
              onItemClick={handleDropdownItemClick}
            />
          </div>
        </div>

        {isExpanded && (
          <div
            style={{
              marginLeft: "20px",
            }}
          >
            {isCreating.showInput && (
              <form
                onSubmit={(e) =>
                  handleSubmission(
                    e,
                    fileTree.name === fileTree.root
                      ? fileTree.name
                      : fileTree.path,
                    fileTree.name === fileTree.root
                      ? fileTree.root
                      : fileTree.containingFolderPath
                  )
                }
                className="flex items-center w-full gap-1.5"
              >
                <span className="file flex items-center justify-center text-neutral-400">
                  {isCreating.isFolder ? (
                    <ChevronRightIcon size={12} />
                  ) : (
                    <FileIcon
                      type={`${fileTree.name && fileTree.name.split(".").at(-1)}`}
                    />
                  )}
                </span>
                <input
                  onBlur={() =>
                    setIsCreating({ ...isCreating, showInput: false })
                  }
                  autoFocus
                  type="text"
                  name="name"
                  className="text-xs outline-none ring-1 ring-neutral-950 ring-inset w-full py-1 px-2 rounded bg-black text-neutral-200 focus:ring-blue-400"
                  style={{ fontSize: "14px" }}
                />
              </form>
            )}
            {fileTree.children?.map((child: any) => (
              <FileTree
                key={child.id}
                handleAddFile={handleAddFile}
                handleAddFolder={handleAddFolder}
                fileTree={child}
                handleRename={handleRename}
                // handleActiveEditorTabs={handleActiveEditorTabs}
                handleDelete={handleDelete}
                onFileClick={onFileClick}
              />
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <div
      //   onClick={() => handleActiveEditorTabs(fileTree.id, fileTree.name, fileTree.data)}
      onMouseOver={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
      className="relative text-xs flex items-center justify-between select-none cursor-pointer py-1 px-2 pr-1 text-neutral-400 rounded hover:bg-neutral-400/20 hover:text-neutral-200"
      onAuxClick={handleKebabClick}
    >
      <div
        className="file flex items-center gap-1.5 flex-1 text-base"
        onClick={() => onFileClick(fileTree.name, fileTree.path)}
      >
        <FileIcon
          type={`${fileTree.name && fileTree.name.split(".").at(-1)}`}
        />
        <span className="-mt-[0.5px] text-base" style={{ fontSize: "14px" }}>
          {isRenaming.showInput && isRenaming.id === fileTree.id ? (
            <input
              ref={inputRef}
              className="w-full h-full border-0 bg-black outline-0 px-0 py-1"
              defaultValue={fileTree.name}
              onChange={(e) =>
                setIsRenaming({ ...isRenaming, newName: e.target.value })
              }
              onBlur={() => {
                handleRenameSubmit();
                setIsRenaming({ showInput: false, id: null });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameSubmit();
                }
              }}
              style={{ fontSize: "14px" }}
            />
          ) : (
            fileTree.name
          )}
        </span>
      </div>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleKebabClick}
          className={`p-1 rounded flex items-center justify-center hover:bg-neutral-400/50 hover:text-neutral-200 focus:bg-neutral-400/50 focus:text-neutral-200 text-base ${
            showOptions || isDropdownOpen ? "visible" : "invisible"
          }`}
        >
          ...
        </button>
        <DropdownMenu
          isOpen={isDropdownOpen}
          fileTreeId={fileTree.id}
          fileTreeName={fileTree.name}
          fileTreeRoot={fileTree.root}
          onClose={handleDropdownClose}
          type="file"
          onItemClick={handleDropdownItemClick}
        />
      </div>
    </div>
  );
}

function DropdownMenu({
  isOpen,
  onClose,
  type,
  onItemClick,
  fileTreeId,
  fileTreeName,
  fileTreeRoot,
}: {
  isOpen: boolean;
  onClose: any;
  type: string;
  onItemClick: any;
  fileTreeId: any;
  fileTreeName: string;
  fileTreeRoot: string;
}) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleClick = (action: any) => (e: any) => {
    e.stopPropagation();
    onItemClick(action, fileTreeId, fileTreeName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute -right-1 top-7 shadow-xl min-w-48 bg-neutral-950 backdrop-blur-3xl z-10 rounded"
    >
      {type === "folder" && (
        <div className="flex flex-col p-1.5 gap-1">
          <button
            onClick={handleClick("newFile")}
            className="w-full text-left cursor-pointer px-3 py-1 text-neutral-400 hover:bg-neutral-400/30 hover:text-neutral-200 rounded text-xs"
            style={{ fontSize: "14" }}
          >
            New File...
          </button>
          <button
            onClick={handleClick("newFolder")}
            className="w-full text-left cursor-pointer px-3 py-1 text-neutral-400 hover:bg-neutral-400/30 hover:text-neutral-200 rounded text-xs"
            style={{ fontSize: "14" }}
          >
            New Folder...
          </button>
        </div>
      )}

      {type === "folder" && (
        <div className="border-t border-neutral-400/30 mt-1" />
      )}

      {fileTreeName !== fileTreeRoot && (
        <div className="flex flex-col p-1.5 gap-1">
          <button
            onClick={handleClick("rename")}
            className="w-full text-left cursor-pointer px-3 py-1 text-neutral-400 hover:bg-neutral-400/30 hover:text-neutral-200 rounded text-xs"
            style={{ fontSize: "14" }}
          >
            Rename...
          </button>
          <button
            onClick={handleClick("delete")}
            className="w-full text-left px-3 py-1 cursor-pointer text-neutral-400 hover:bg-neutral-400/30 hover:text-neutral-200 rounded text-xs"
            style={{ fontSize: "14" }}
          >
            Delete {type === "folder" ? "Folder" : "File"}
          </button>
        </div>
      )}
    </div>
  );
}

export default FileTree;
