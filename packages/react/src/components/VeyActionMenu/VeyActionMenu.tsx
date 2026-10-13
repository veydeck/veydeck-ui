import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { VeyIcon } from "../VeyIcon/VeyIcon";
import { VeyTooltip } from "../VeyTooltip/VeyTooltip";
import "./VeyActionMenu.css";
import { computeFloatingPosition } from "../../internal/floating-position";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";

const ACTION_MENU_OPEN_EVENT = "veydeck-action-menu-open";

export interface VeyAction {
  label: string;
  className?: string;
  icon?: string;
  disabled?: boolean;
  tooltip?: string;
  handler: () => void;
}

export interface VeyActionMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 操作列表 */
  actions: VeyAction[];
  /** 按钮文案 */
  label?: string;
  /** 是否禁用菜单入口 */
  disabled?: boolean;
  /** 菜单项默认图标 */
  defaultIcon?: string;
  /** 液态玻璃材质配置 */
  glass?: VeyGlassValue;
}

export const VeyActionMenu: React.FC<VeyActionMenuProps> = ({
  actions,
  label = "操作",
  disabled = false,
  defaultIcon = "settings",
  glass,
  className = "",
  ...rest
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [dropdownPositioned, setDropdownPositioned] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [dropdownPlacement, setDropdownPlacement] = useState<"top" | "bottom">(
    "bottom",
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerGlassRef = useGlass<HTMLButtonElement>(glass, "control");
  const dropdownGlassRef = useGlass<HTMLDivElement>(glass, "control");

  const updateDropdownPosition = useCallback(() => {
    if (!menuRef.current || !dropdownRef.current || !showMenu) return;
    const position = computeFloatingPosition({
      anchor: menuRef.current,
      floating: dropdownRef.current,
    });
    setDropdownPlacement(position.placement);
    setDropdownStyle(position.style);
    setDropdownPositioned(true);
  }, [showMenu]);

  useEffect(() => {
    if (showMenu) {
      updateDropdownPosition();
    }
  }, [showMenu, updateDropdownPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setShowMenu(false);
        setDropdownPositioned(false);
      }
    };
    const handleOtherMenuOpen = (event: Event) => {
      if (
        (event as CustomEvent<HTMLElement | null>).detail !== menuRef.current
      ) {
        setShowMenu(false);
        setDropdownPositioned(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener(ACTION_MENU_OPEN_EVENT, handleOtherMenuOpen);
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener(ACTION_MENU_OPEN_EVENT, handleOtherMenuOpen);
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [updateDropdownPosition]);

  const toggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (disabled) return;
    if (showMenu) {
      setShowMenu(false);
      setDropdownPositioned(false);
      return;
    }
    setDropdownPositioned(false);
    setShowMenu(true);
    document.dispatchEvent(
      new CustomEvent(ACTION_MENU_OPEN_EVENT, { detail: menuRef.current }),
    );
  };

  const handleActionClick = (
    action: VeyAction,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    if (action.disabled) return;
    action.handler();
    setShowMenu(false);
    setDropdownPositioned(false);
  };
  const focusItem = (index: number) => {
    const items = [
      ...(dropdownRef.current?.querySelectorAll<HTMLButtonElement>(
        ".vl-dropdown-item:not(:disabled)",
      ) ?? []),
    ];
    items[(index + items.length) % items.length]?.focus();
  };
  const handleTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (!["Enter", " ", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    setDropdownPositioned(false);
    setShowMenu(true);
    document.dispatchEvent(
      new CustomEvent(ACTION_MENU_OPEN_EVENT, { detail: menuRef.current }),
    );
    requestAnimationFrame(() => {
      updateDropdownPosition();
      focusItem(0);
    });
  };
  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = [
      ...(dropdownRef.current?.querySelectorAll<HTMLButtonElement>(
        ".vl-dropdown-item:not(:disabled)",
      ) ?? []),
    ];
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(index + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      focusItem(event.key === "Home" ? 0 : items.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setShowMenu(false);
      setDropdownPositioned(false);
      menuRef.current
        ?.querySelector<HTMLButtonElement>(".vl-action-btn")
        ?.focus();
    }
  };

  return (
    <div
      className={`vl-action-menu ${className}`.trim()}
      ref={menuRef}
      {...rest}
    >
      <button
        ref={triggerGlassRef}
        type="button"
        className="vl-action-btn"
        disabled={disabled}
        onClick={toggleMenu}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={showMenu}
      >
        <VeyIcon className="vl-action-btn-icon" name="settings" size={16} />
        <span className="vl-action-btn-text">{label}</span>
      </button>

      {showMenu &&
        createPortal(
          <div
            ref={(node) => {
              dropdownRef.current = node;
              dropdownGlassRef(node);
            }}
            className={`vl-dropdown ${dropdownPositioned ? "is-positioned" : ""}`.trim()}
            role="menu"
            style={dropdownStyle}
            data-placement={dropdownPlacement}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleMenuKeyDown}
          >
            {actions.map((action, index) => {
              const itemClass = (action.className || "").trim();
              const isDisabled = action.disabled;
              const buttonNode = (
                <button
                  type="button"
                  className={`vl-dropdown-item ${itemClass} ${isDisabled ? "is-disabled" : ""}`.trim()}
                  disabled={isDisabled}
                  role="menuitem"
                  onClick={(e) => handleActionClick(action, e)}
                >
                  <VeyIcon
                    className="vl-dropdown-icon"
                    name={action.icon || defaultIcon}
                    size={16}
                  />
                  <span className="vl-dropdown-label">{action.label}</span>
                </button>
              );

              return (
                <VeyTooltip
                  key={index}
                  text={action.tooltip || ""}
                  disabled={!action.tooltip}
                  position="right"
                  glass={glass}
                  className="vl-dropdown-tooltip-wrapper"
                >
                  {buttonNode}
                </VeyTooltip>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
};
