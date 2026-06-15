import { useState } from "react";
import { defaultTabs } from "./data";

export function Tabs({ tabs = defaultTabs }) {
  const [active, setActive] = useState(tabs[0].id);
  const activeTab = tabs.find((tab) => tab.id === active);

  return (
    <div className="ui-tabs">
      <div className="ui-tab-list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`ui-tab${tab.id === active ? " is-active" : ""}`}
            onClick={() => setActive(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="ui-tab-panel" role="tabpanel">
        {activeTab?.content}
      </div>
    </div>
  );
}
