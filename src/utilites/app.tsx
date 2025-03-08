import React, { useEffect, useRef, useState } from "react";
import { RouterProvider } from "react-router-dom";
import router from "../helpers/router";
import { useAppDispatch, useAppSelector } from "../helpers/hooks";
import {
  IEditorSettings,
  IFolderStructure,
  IUI,
  IUIState,
} from "../helpers/types";
import {
  set_folder_structure,
  update_settings,
  update_ui,
  update_ui_state,
} from "../helpers/state-manager";
import { ConfigProvider, theme } from "antd/es";
import { PrimeReactProvider } from "primereact/api";
import { AnantProvider } from "../../extensions/ui-kit";
import { MainContext } from "../helpers/functions";
import { FluentProvider, webDarkTheme } from "@fluentui/react-components";
import { Command } from "cmdk";
import { commands } from "./commands";

const App = React.memo((props: any) => {
  const dispatch = useAppDispatch();
  const settingsDe = useAppSelector((state) => state.main.editorSettings);
  const stateDe = useAppSelector((state) => state.main.uiState);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "p") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCommandSelect = (commandId: string) => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send("execute-command", commandId);
    } else {
      console.error("IPC Renderer is not available.");
    }
  };

  const { handle_set_editor } = React.useContext(MainContext) || {};

  const handleSetEditor = React.useCallback(
    async (branch_name: string, full_path: string) => {
      console.log("branch", branch_name, full_path);
      const content = await window.electron.get_file_content(full_path);

      if (typeof handle_set_editor === "function") {
        handle_set_editor({ name: branch_name, path: full_path, content });
      } else {
        console.error("handle_set_editor is not defined");
      }
    },
    [handle_set_editor]
  );

  const startup = React.useCallback(async () => {
    const ui = (await window.electron.get_ui()) as IUI;
    const folder = (await window.electron.get_folder()) as IFolderStructure;
    const settings = (await window.electron.get_settings()) as IEditorSettings;
    const state = (await window.electron.get_ui_state()) as IUIState;

    if (!localStorage.getItem("mnovus_meridia")) {
      window.electron.set_settings(settingsDe);
      window.electron.set_ui_state(stateDe);
      localStorage.setItem("mnovus_meridia", "false");
    }

    if (folder) dispatch(set_folder_structure(folder));
    if (settings) dispatch(update_settings(settings));
    if (state) dispatch(update_ui_state(state));
    if (ui) dispatch(update_ui(ui));
    if (state) {
      if (state.active_file) {
      }
    }
  }, [dispatch]);

  React.useLayoutEffect(() => {
    startup();
  }, [startup]);

  return (
    <FluentProvider theme={webDarkTheme}>
      <AnantProvider mode="dark">
        <PrimeReactProvider>
          <ConfigProvider
            theme={{
              algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
              components: {
                Splitter: {
                  splitBarSize: 0,
                },
              },
            }}
          >
            {open && (
              <div className="overlay" onClick={() => setOpen(false)}>
                <div
                  className="command-palette"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Command>
                    <Command.Input
                      value={search}
                      onValueChange={setSearch}
                      placeholder="Type a command..."
                      className="command-input"
                      autoFocus
                    />
                    <Command.List>
                      {commands
                        .filter((cmd) =>
                          cmd.label.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((cmd) => (
                          <Command.Item
                            key={cmd.id}
                            onSelect={() => {
                              handleCommandSelect(cmd.id);
                              setOpen(false);
                            }}
                            className="command-item"
                          >
                            <span>{cmd.label}</span>
                            <div className="shortcut-container">
                              {cmd.shortcut.map((key, index) => (
                                <React.Fragment key={index}>
                                  <span className="shortcut-box">{key}</span>
                                  {index < cmd.shortcut.length - 1 && (
                                    <span className="plus">+</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </Command.Item>
                        ))}
                    </Command.List>
                  </Command>
                </div>
              </div>
            )}
            <RouterProvider router={router} />
          </ConfigProvider>
        </PrimeReactProvider>
      </AnantProvider>
    </FluentProvider>
  );
});

export default App;
