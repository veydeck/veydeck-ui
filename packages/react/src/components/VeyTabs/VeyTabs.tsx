import React from "react";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeyTabs.css";

export interface TabItem {
  label: string;
  name: string;
  disabled?: boolean;
}

export interface VeyTabsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  /** 当前选中的标签页 name */
  value: string;
  /** 标签页列表 */
  tabs: TabItem[];
  /** 绑定值改变事件 */
  onChange?: (name: string) => void;
  glass?: VeyGlassValue;
}

interface TabButtonProps {
  tab: TabItem;
  active: boolean;
  glass?: VeyGlassValue;
  onClick: () => void;
  onKeyDown: React.KeyboardEventHandler<HTMLButtonElement>;
}

const TabButton: React.FC<TabButtonProps> = ({
  tab,
  active,
  glass,
  onClick,
  onKeyDown,
}) => {
  const glassRef = useGlass<HTMLButtonElement>(glass, "control", active);
  return (
    <button
      ref={glassRef}
      type="button"
      className={`vl-tabs-item ${active ? "is-active" : ""} ${tab.disabled ? "is-disabled" : ""}`.trim()}
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      disabled={tab.disabled}
      data-tab-name={tab.name}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {tab.label}
    </button>
  );
};

export const VeyTabs: React.FC<VeyTabsProps> = ({
  value,
  tabs = [],
  onChange,
  glass,
  className = "",
  ...rest
}) => {
  const handleTabClick = (tab: TabItem) => {
    if (tab.disabled) return;
    onChange?.(tab.name);
  };
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const enabled = tabs
      .map((tab, tabIndex) => ({ tab, tabIndex }))
      .filter(({ tab }) => !tab.disabled);
    const current = enabled.findIndex(({ tabIndex }) => tabIndex === index);
    const target =
      event.key === "Home"
        ? enabled[0]
        : event.key === "End"
          ? enabled.at(-1)
          : enabled[
              (current +
                (event.key === "ArrowRight" ? 1 : -1) +
                enabled.length) %
                enabled.length
            ];
    if (target) {
      handleTabClick(target.tab);
      document
        .querySelector<HTMLElement>(`[data-tab-name="${target.tab.name}"]`)
        ?.focus();
    }
  };

  return (
    <div className={`vl-tabs ${className}`.trim()} {...rest}>
      <div className="vl-tabs-nav" role="tablist">
        {tabs.map((tab) => (
          <TabButton
            key={tab.name}
            tab={tab}
            active={value === tab.name}
            glass={glass}
            onClick={() => handleTabClick(tab)}
            onKeyDown={(event) => handleKeyDown(event, tabs.indexOf(tab))}
          />
        ))}
      </div>
    </div>
  );
};
