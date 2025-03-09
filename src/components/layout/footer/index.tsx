import React from "react";
import { useAppSelector } from "../../../helpers/hooks";
import { get_file_types } from "../../../helpers/functions";
import { notificationWorker } from "../../../../main/workers/notificationWorker";
import { ReactComponent as BellIcon } from "../../../assets/svg/bell-dot.svg";

import "./index.css";
import {
  CloseCircleOutlined,
  CloseOutlined,
  InfoCircleFilled,
} from "@ant-design/icons/lib";

const FooterComponent = React.memo(() => {
  const folder_structure = useAppSelector(
    (state) => state.main.folder_structure
  );
  const editor_indent = useAppSelector((state) => state.main.indent);
  const active_file = useAppSelector((state) => state.main.active_file);
  const ui = useAppSelector((state) => state.main.ui);

  const [notificationModelVisible, setNotificationModelVisible] =
    React.useState(false);

  const [notifications, setNotifications] = React.useState(
    notificationWorker.getNotifications()
  );

  const footerRef = React.useRef(null);
  const [footerHeight, setFooterHeight] = React.useState(0);

  React.useEffect(() => {
    if (footerRef.current) {
      setFooterHeight(footerRef.current.clientHeight);
    }
  }, [footerRef.current]);

  React.useEffect(() => {
    const updateNotifications = () => {
      setNotifications(notificationWorker.getNotifications());
    };

    notificationWorker.subscribe(updateNotifications);

    updateNotifications();

    return () => {
      notificationWorker.unsubscribe(updateNotifications);
    };
  }, []);

  const extensionItem = ui.footer.find((item) => item.type === "extensions");

  return (
    <div
      className="footer-section"
      style={{
        borderTop: "1px solid var(--main-border-color)",
        display: "flex",
        justifyContent: "space-between",
        padding: "4px 8px",
        alignItems: "center",
      }}
      ref={footerRef}
    >
      {ui.footer.some((item) => item.type === "project-name") && (
        <div>
          <span>
            {active_file?.name ||
              folder_structure?.name?.split(/\/|\\/).at(-1) ||
              "main"}
          </span>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        {ui.footer.some((item) => item.type === "editor-indent") && (
          <div>
            Ln {editor_indent.line}, Col {editor_indent.column} (
            {editor_indent.selected} selected)
          </div>
        )}

        {ui.footer.some((item) => item.type === "editor-spaces") && (
          <div>Spaces: 4</div>
        )}

        {ui.footer.some((item) => item.type === "editor-utf") && (
          <div>UTF-8</div>
        )}

        {ui.footer.some((item) => item.type === "selected-file-language") &&
          active_file?.name && (
            <div style={{ textTransform: "capitalize" }}>
              {get_file_types(active_file.name)}
            </div>
          )}

        <div>
          <span onClick={() => setNotificationModelVisible((prev) => !prev)}>
            <BellIcon />
          </span>

          {notificationModelVisible && (
            <div
              className="notification-model"
              style={{ bottom: `${footerHeight + 10}px` }}
            >
              <div className="title">
                <p>NOTIFICATIONS</p>
                <button onClick={() => setNotificationModelVisible(false)}>
                  <CloseOutlined />
                </button>
              </div>

              <div className="notifications-wrapper">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`notification ${notif.type}`}>
                    <div className="section">
                      <div className="info-section">
                        {notif.type === "info" ? (
                          <InfoCircleFilled />
                        ) : (
                          <CloseCircleOutlined />
                        )}
                        <p>{notif.message}</p>
                      </div>
                      <div className="actions">
                        <button
                          onClick={() =>
                            notificationWorker.removeNotification(notif.id)
                          }
                        >
                          <CloseOutlined />
                        </button>
                      </div>
                    </div>

                    <div className="section">
                      <div className="source">From {notif.source}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default FooterComponent;
