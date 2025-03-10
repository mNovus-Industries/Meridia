import React, { useEffect, useRef, useState } from "react";
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

  const [notificationModelVisible, setNotificationModelVisible] =
    useState(false);
  const [notifications, setNotifications] = useState(
    notificationWorker.getNotifications()
  );

  const footerRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(notificationWorker.getNotifications());
    };

    notificationWorker.subscribe(updateNotifications);
    updateNotifications();

    return () => {
      notificationWorker.unsubscribe(updateNotifications);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        event.target.closest(".bell-icon") === null
      ) {
        setNotificationModelVisible(false);
      }
    };

    if (notificationModelVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationModelVisible]);

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
      <div>
        <span>
          {active_file?.name ||
            folder_structure?.name?.split(/\/|\\/).at(-1) ||
            "main"}
        </span>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <div>
          Ln {editor_indent.line}, Col {editor_indent.column} (
          {editor_indent.selected} selected)
        </div>

        <div>Spaces: 4</div>

        <div>UTF-8</div>

        {active_file?.name && (
          <div style={{ textTransform: "capitalize" }}>
            {get_file_types(active_file.name)}
          </div>
        )}

        <div>
          <span
            className="bell-icon"
            onClick={() => setNotificationModelVisible((prev) => !prev)}
          >
            <BellIcon />
          </span>

          {notificationModelVisible && (
            <div
              ref={notificationRef}
              className="notification-model"
              style={{ bottom: `50px` }}
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
