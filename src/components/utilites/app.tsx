import React, { useEffect, useState } from "react";
import { Splitter } from "antd";

import FooterComponent from "../layout/footer";
import ContentSection from "../layout/content";
import { BottomTabs } from "../bottom-tabs";

import Header from "../layout/header";

import { ReactComponent as StudioIcon } from "../../assets/files/remote.svg";

import PerfectScrollbar from "react-perfect-scrollbar";

import { useAppDispatch, useAppSelector } from "../../helpers/hooks";
import {
  update_active_file,
  update_active_files,
  update_sidebar_active,
} from "../../helpers/state-manager";
import { store } from "../../helpers/store";
import { PluginAPI } from "../../../plugins/api/pluginAPI";
import { VariableSection } from "../layout/variable";
import Folders from "../sidebar/folders";

import { FolderOutlined, SettingOutlined } from "@ant-design/icons";

import Tooltip from "../../../support/ui-kit/tooltip/Tooltip";

import "./index.css";

const iconMap: Record<string, JSX.Element> = {
  Folders: <FolderOutlined />,
  Settings: <SettingOutlined />,
  "Meridia Studio": <StudioIcon />,
};

export const App = () => {
  const sidebarActive = useAppSelector((state) => state.main.sidebar_active);
  const rightPanelActive = useAppSelector(
    (state) => state.main.right_sidebar_active
  );
  const bottomPanelActive = useAppSelector(
    (state) => state.main.bottom_panel_active
  );

  const [activeItem, setActiveItem] = useState<string | null>("Folders");
  const [pluginContent, setPluginContent] = useState<React.ReactNode | null>(
    null
  );

  const dispatch = useAppDispatch();

  const items = [
    {
      name: "Folders",
      key: 0,
      icon: <FolderOutlined />,
      content: <Folders />,
    },
  ];

  const openSettings = () => {
    console.log("opening settings");

    const settingsFile = {
      path: "/settings",
      name: "Settings",
      icon: "settings",
      is_touched: false,
      content: "",
    };

    const current_active_files = [...store.getState().main.active_files];

    const settingsIndex = current_active_files.findIndex(
      (file) => file.name === "Settings"
    );

    if (settingsIndex === -1) {
      current_active_files.push(settingsFile);
    } else {
      dispatch(update_active_file(settingsFile));
      return;
    }

    dispatch(update_active_files(current_active_files));
    dispatch(update_active_file(settingsFile));
  };

  const openMeridiaStudio = () => {
    const meridiaStudioFile = {
      path: "/studio",
      name: "Studio",
      icon: "Studio",
      is_touched: false,
      content: "",
    };

    const current_active_files = [...store.getState().main.active_files];

    const studioIndex = current_active_files.findIndex(
      (file) => file.name === "Studio"
    );

    if (studioIndex === -1) {
      current_active_files.push(meridiaStudioFile);
    } else {
      dispatch(update_active_file(meridiaStudioFile));
      return;
    }

    dispatch(update_active_files(current_active_files));
    dispatch(update_active_file(meridiaStudioFile));
  };

  useEffect(() => {
    window.electron.ipcRenderer.on("open-settings", () => {
      openSettings();
    });
    return () =>
      window.electron.ipcRenderer.removeListener("open-settings", openSettings);
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.on("open-meridia-studio", () => {
      openMeridiaStudio();
    });
    return () =>
      window.electron.ipcRenderer.removeListener(
        "open-meridia-studio",
        openMeridiaStudio
      );
  }, []);

  const handleClick = ({
    item,
  }: {
    item: { content: string; name: string };
  }) => {
    if (item.content === "settings") return openSettings();
    if (item.content === "mstudio") return openMeridiaStudio();

    if (item.content === "content") {
      const isActive = activeItem === item.name ? null : item.name;
      setActiveItem(isActive);
      dispatch(update_sidebar_active(isActive !== null));
    }
  };

  const handlePluginClick = (iconId: string) => {
    setActiveItem(iconId);
    setPluginContent(PluginAPI.sidebarContent[iconId] || null);
  };

  return (
    <div
      className="wrapper-component"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderTop: "1px solid var(--border-color)",
        overflow: "hidden",
      }}
    >
      <Header />
      <div className="middle-section" style={{ flex: 1, display: "flex" }}>
        <div className="sidebar" style={{ background: "#363636" }}>
          <div className="top">
            <Tooltip text="Folders (Ctrl+Shift+F)" position="right">
              <div
                className={`sidebar-item ${activeItem === "Folders" ? "active" : ""}`}
                onClick={() =>
                  handleClick({ item: { name: "Folders", content: "content" } })
                }
              >
                {iconMap["Folders"]}
              </div>
            </Tooltip>
          </div>

          <div className="bottom">
            <Tooltip text="Settings (Ctrl+Shift+S)" position="right">
              <div
                className={`sidebar-item ${activeItem === "Settings" ? "active" : ""}`}
                onClick={() =>
                  handleClick({
                    item: { name: "Settings", content: "settings" },
                  })
                }
              >
                {iconMap["Settings"]}
              </div>
            </Tooltip>

            <Tooltip text="Meridia Studio (Ctrl+Shift+M)" position="right">
              <div
                className={`sidebar-item ${activeItem === "Meridia Studio" ? "active" : ""}`}
                onClick={() =>
                  handleClick({ item: { name: "MStudio", content: "mstudio" } })
                }
              >
                {iconMap["Meridia Studio"]}
              </div>
            </Tooltip>
          </div>
        </div>

        <Splitter
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Splitter.Panel>
            <Splitter layout="vertical">
              <Splitter.Panel>
                <Splitter layout="horizontal">
                  <Splitter.Panel
                    defaultSize="20%"
                    size={sidebarActive ? undefined : "0%"}
                    collapsible
                    max="90%"
                    style={{
                      borderRight: sidebarActive
                        ? "1px solid var(--main-border-color)"
                        : "none",
                      height: "100%",
                    }}
                  >
                    <PerfectScrollbar
                      options={{ suppressScrollX: true }}
                      style={{ maxHeight: "100%", overflow: "auto" }}
                    >
                      <div>
                        {
                          items.find((item) => item.name === activeItem)
                            ?.content
                        }
                      </div>
                    </PerfectScrollbar>
                  </Splitter.Panel>
                  <Splitter.Panel>
                    <Splitter layout="horizontal">
                      <Splitter.Panel>
                        <ContentSection />
                      </Splitter.Panel>
                      <Splitter.Panel
                        defaultSize="20%"
                        size={rightPanelActive ? undefined : "0%"}
                        collapsible
                        max="90%"
                        style={{
                          borderLeft: rightPanelActive
                            ? "1px solid var(--main-border-color)"
                            : "none",
                          height: "100%",
                        }}
                      >
                        <PerfectScrollbar>
                          <VariableSection />
                        </PerfectScrollbar>
                      </Splitter.Panel>
                    </Splitter>
                  </Splitter.Panel>
                </Splitter>
              </Splitter.Panel>

              <Splitter.Panel
                defaultSize="30%"
                size={bottomPanelActive ? undefined : "0%"}
                min="10%"
                max="90%"
                collapsible
                className="terminal"
                style={{
                  borderTop: "1px solid var(--main-border-color)",
                  background: "#1e1e1e",
                }}
              >
                <BottomTabs />
              </Splitter.Panel>
            </Splitter>
          </Splitter.Panel>
        </Splitter>
      </div>
      <FooterComponent />
    </div>
  );
};
