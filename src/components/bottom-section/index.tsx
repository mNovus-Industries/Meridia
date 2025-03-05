import { useAppDispatch, useAppSelector } from "../../shared/hooks";
import {
  update_current_bottom_tab,
  update_bottom_panel_active,
} from "../../shared/rdx-slice";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Tabs } from "../../../extensions/meridiaui/index";
import Output from "../output-section";
import { Terminal } from "../terminal-section";
import { CloseOutlined } from "@ant-design/icons/lib";

export const BottomTabs = () => {
  const currentTab = useAppSelector((state) => state.main.current_bottom_tab);
  const dispatch = useAppDispatch();

  return (
    <div
      className="bottom-wrapper"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <Tabs
        items={[
          {
            key: 1,
            name: "Output",
            closable: false,
            onTabClick: () => dispatch(update_current_bottom_tab(1)),
            tooltip: "Output ( Ctrl + K )",
          },
          {
            key: 2,
            name: "Terminal",
            closable: false,
            onTabClick: () => dispatch(update_current_bottom_tab(2)),
            tooltip: "Terminal ( Ctrl + ` )",
          },
        ]}
        customButtons={[
          <button onClick={() => dispatch(update_bottom_panel_active(false))}>
            <CloseOutlined />
          </button>,
        ]}
        customButtonsTooltip={["Hide"]}
        activeManualTab={currentTab}
      />
      <PerfectScrollbar>
        <div className="tab-content" style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ display: currentTab === 1 ? "block" : "none" }}>
            <Output />
          </div>
          <div style={{ display: currentTab === 2 ? "block" : "none" }}>
            <Terminal />
          </div>
        </div>
      </PerfectScrollbar>
    </div>
  );
};
