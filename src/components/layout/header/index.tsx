import { useEffect, useState, useRef, useCallback } from "react";

import { BarsOutlined, CaretRightOutlined } from "@ant-design/icons/lib";

import { useAppDispatch } from "../../../helpers/hooks";
import { useAppSelector } from "../../../helpers/hooks";

import Tooltip from "../../../../support/ui-kit/tooltip/Tooltip";

import { ReactComponent as PanelBottom } from "../../../assets/svg/layout-panel.svg";
import { ReactComponent as PanelBottomOff } from "../../../assets/svg/layout-panel-off.svg";

import { ReactComponent as PanelLeft } from "../../../assets/svg/layout-sidebar-left.svg";
import { ReactComponent as PanelLeftOff } from "../../../assets/svg/layout-sidebar-left-off.svg";

import { ReactComponent as PanelRight } from "../../../assets/svg/layout-panel-sidebar-right.svg";
import { ReactComponent as PanelRightOff } from "../../../assets/svg/layout-panel-sidebar-right-off.svg";

import { ReactComponent as Minimize } from "../../../assets/window-controls/minimize.svg";
import { ReactComponent as Maximize } from "../../../assets/window-controls/maximize.svg";
import { ReactComponent as Restore } from "../../../assets/window-controls/restore.svg";
import { ReactComponent as Close } from "../../../assets/window-controls/close.svg";

import {
  update_sidebar_active,
  update_bottom_panel_active,
  update_right_panel_active,
  update_env_vars,
} from "../../../helpers/state-manager";
import { update_current_bottom_tab } from "../../../helpers/state-manager";

import { notificationWorker } from "../../../../main/workers/notificationWorker";

import { debounce } from "lodash";

import Logo from "../../../assets/logo.png";

import "./header.css";

export default function Header() {
  const [menuItems, setMenuItems] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const [isMaximized, setIsMaximized] = useState<boolean | null>(true);

  const menuRef = useRef(null);
  const runRef = useRef<HTMLButtonElement>(null);

  const sidebar_active = useAppSelector((state) => state.main.sidebar_active);
  const right_sidebar_active = useAppSelector(
    (state) => state.main.right_sidebar_active
  );
  const bottom_panel_active = useAppSelector(
    (state) => state.main.bottom_panel_active
  );
  const current_bottom_tab = useAppSelector(
    (state) => state.main.current_bottom_tab
  );
  const dispatch = useAppDispatch();

  const folder_strucutre = useAppSelector(
    (state) => state.main.folder_structure
  );

  const { active_file } = useAppSelector((state) => ({
    active_file: state.main.active_file,
  }));

  useEffect(() => {
    window.electron.getMenu().then((menu: any) => {
      setMenuItems(menu || []);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
        setActiveSubmenu(null);
      }
    };

    if (menuVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuVisible]);

  const handleRun = useCallback(() => {
    dispatch(update_bottom_panel_active(true));
    dispatch(update_current_bottom_tab(1));

    window.electron.ipcRenderer.send("file-run", active_file.path);

    const notifId = notificationWorker.addNotification(
      `Running "${active_file.name}"`,
      "info",
      "Meridia"
    );

    setTimeout(() => {
      notificationWorker.removeNotification(notifId);
    }, 4000);

    const handleVariablesResult = (event: any, variables: any) => {
      console.log("Received variables", variables);
      const varNotifId = notificationWorker.addNotification(
        `Getting Variables from file "${active_file.name}"`,
        "info",
        "Meridia"
      );

      dispatch(update_env_vars(variables));

      setTimeout(() => {
        notificationWorker.removeNotification(varNotifId);
      }, 4000);
    };

    const handleVariablesError = (event: any, error: any) => {
      console.error("Error receiving variables:", error);
      const errorNotifId = notificationWorker.addNotification(
        `Error Getting Variables from file "${active_file.name}"`,
        "error",
        "Meridia"
      );

      setTimeout(() => {
        notificationWorker.removeNotification(errorNotifId);
      }, 4000);
    };

    window.electron.ipcRenderer.once("variables-result", handleVariablesResult);
    window.electron.ipcRenderer.once("variables-error", handleVariablesError);
  }, [active_file, dispatch]);

  useEffect(() => {
    if (runRef.current) {
      runRef.current.disabled = !active_file;
    }
  }, [active_file]);

  useEffect(() => {
    window.electron.ipcRenderer.on("run-current-file", handleRun);
    return () => {
      window.electron.ipcRenderer.removeListener("run-current-file", handleRun);
    };
  }, [handleRun]);

  const toggleSidebar = useCallback(
    debounce(() => dispatch(update_sidebar_active(!sidebar_active)), 50),
    [sidebar_active]
  );

  const toggleRightPanel = useCallback(
    debounce(
      () => dispatch(update_right_panel_active(!right_sidebar_active)),
      50
    ),
    [right_sidebar_active]
  );

  const toggleBottomPanel = useCallback(
    debounce(({ state }) => {
      dispatch(update_bottom_panel_active(state ?? !bottom_panel_active));
    }, 50),
    [bottom_panel_active]
  );

  useEffect(() => {
    const openPanelHandler = (tab: any) => {
      if (bottom_panel_active && current_bottom_tab === tab) {
        toggleBottomPanel({ state: false });
      } else {
        toggleBottomPanel({ state: true });
        dispatch(update_current_bottom_tab(tab));
      }
    };

    window.electron.ipcRenderer.on("open-terminal", () => openPanelHandler(2));
    window.electron.ipcRenderer.on("open-output", () => openPanelHandler(1));
    window.electron.ipcRenderer.on("open-bottom-panel", () =>
      dispatch(update_bottom_panel_active(!bottom_panel_active))
    );
    window.electron.ipcRenderer.on("open-sidebar", toggleSidebar);
    window.electron.ipcRenderer.on("open-right-panel", toggleRightPanel);

    return () => {
      window.electron.ipcRenderer.removeAllListeners("open-terminal");
      window.electron.ipcRenderer.removeAllListeners("open-output");
      window.electron.ipcRenderer.removeAllListeners("open-bottom-panel");
      window.electron.ipcRenderer.removeAllListeners("open-sidebar");
      window.electron.ipcRenderer.removeAllListeners("open-right-panel");
    };
  }, [
    dispatch,
    bottom_panel_active,
    current_bottom_tab,
    toggleSidebar,
    toggleRightPanel,
  ]);

  useEffect(() => {
    const handleMaximized = () => setIsMaximized(true);
    const handleRestored = () => setIsMaximized(false);

    window.electron.ipcRenderer.on(
      "window-changed-to-maximized",
      handleMaximized
    );
    window.electron.ipcRenderer.on("window-changed-to-restore", handleRestored);

    return () => {
      window.electron.ipcRenderer.removeListener(
        "window-changed-to-maximized",
        handleMaximized
      );
      window.electron.ipcRenderer.removeListener(
        "window-changed-to-restore",
        handleRestored
      );
    };
  }, []);

  const handleWindowAction = (action: any) => {
    window.electron.ipcRenderer.invoke(action, "");
  };

  const handleMenuClick = useCallback((menuId: string) => {
    window.electron.ipcRenderer.send("menu-click", menuId);
  }, []);

  return (
    <div className="header-wrapper">
      <div className="props">
        <div className="logo">
          <img
            src={Logo}
            alt="Logo"
            style={{
              width: "28px",
              height: "auto",
              borderRadius: "12px",
            }}
          />
        </div>
        <button onClick={() => setMenuVisible((prev) => !prev)}>
          <BarsOutlined />
        </button>
        {menuVisible ? (
          <div className="menu-wrapper" ref={menuRef}>
            <div className="menu">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="menu-item"
                  onMouseEnter={() => setActiveSubmenu(index)}
                  onClick={() => {
                    setActiveSubmenu((prev) => (prev === index ? null : index));
                    handleMenuClick(item.id);
                  }}
                >
                  <div className="menu-item-text">
                    {item.label}
                    {item.accelerator && (
                      <span className="shortcut">{item.accelerator}</span>
                    )}
                  </div>
                  {item.submenu && activeSubmenu === index && (
                    <div className="submenu">
                      {item.submenu.map((sub: any, subIndex: any) => (
                        <div
                          key={subIndex}
                          className={` ${sub.label === "" ? "separator" : "submenu-item"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuClick(sub.id);
                            setActiveSubmenu(-1);
                          }}
                        >
                          {sub.label}
                          {sub.accelerator && (
                            <span className="shortcut">{sub.accelerator}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="project-info">
            {folder_strucutre?.name?.split(/[/\\]/).at(-1) ||
              "No Project Selected"}
          </div>
        )}
      </div>

      <div className="controls">
        <Tooltip text="Run ( F12 )">
          <button onClick={handleRun} ref={runRef} className="run-tool">
            <CaretRightOutlined style={{}} />
          </button>
        </Tooltip>

        <button onClick={() => toggleBottomPanel({ state: null })} style={{}}>
          {bottom_panel_active ? (
            <Tooltip text="Toggle Panel ( Ctrl + ` )" position="left">
              <PanelBottom />
            </Tooltip>
          ) : (
            <Tooltip text="Toggle Panel ( Ctrl + ` )" position="left">
              <PanelBottomOff />
            </Tooltip>
          )}
        </button>

        <button onClick={toggleSidebar} style={{}}>
          {sidebar_active ? (
            <Tooltip text="Toggle Primary Sidebar ( Ctrl + B )" position="left">
              <PanelLeft />
            </Tooltip>
          ) : (
            <Tooltip text="Toggle Primary Sidebar ( Ctrl + B )" position="left">
              <PanelLeftOff />
            </Tooltip>
          )}
        </button>

        <button
          onClick={toggleRightPanel}
          style={{
            marginRight: "60px",
          }}
        >
          {right_sidebar_active ? (
            <Tooltip
              text="Toggle Right Panel ( Ctrl + Alt + B )"
              position="left"
            >
              <PanelRight />
            </Tooltip>
          ) : (
            <Tooltip
              text="Toggle Right Panel ( Ctrl + Alt + B )"
              position="left"
            >
              <PanelRightOff />
            </Tooltip>
          )}
        </button>

        <div className="window-controls">
          <button onClick={() => handleWindowAction("minimize")}>
            <Minimize />
          </button>
          <button
            onClick={() =>
              handleWindowAction(isMaximized ? "restore" : "maximize")
            }
          >
            {isMaximized ? <Restore /> : <Maximize />}
          </button>
          <button onClick={() => handleWindowAction("close")}>
            <Close />
          </button>
        </div>
      </div>
    </div>
  );
}
