import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  useId,
} from "react";
import { createPortal } from "react-dom";
import { computeFloatingPosition } from "../../internal/floating-position";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeySelect.css";

export interface VeySelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  hint?: string;
}

export interface VeySelectProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | "value"
  | "onChange"
  | "id"
  | "aria-label"
  | "aria-labelledby"
  | "aria-describedby"
> {
  /** 绑定值 */
  value: string | number | null;
  /** 选项列表 */
  options: VeySelectOption[];
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  /** 改变值时的回调 */
  onChange?: (value: string | number | null) => void;
  /** 禁用选项被点击时的回调 */
  onOptionDisabled?: (option: VeySelectOption) => void;
  /** 下拉列表滚动时的回调 */
  onDropdownScroll?: (event: React.UIEvent<HTMLUListElement>) => void;
  /** 下拉列表滚动到底部附近时的回调 */
  onDropdownReachBottom?: (event: React.UIEvent<HTMLUListElement>) => void;
  /** 下拉列表底部内容 */
  dropdownFooter?: React.ReactNode;
  /** 液态玻璃材质配置 */
  glass?: VeyGlassValue;
}

const SCROLL_BOTTOM_THRESHOLD = 24;

export const VeySelect: React.FC<VeySelectProps> = ({
  value,
  options,
  placeholder = "请选择",
  disabled = false,
  id,
  name,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  onChange,
  onOptionDisabled,
  onDropdownScroll,
  onDropdownReachBottom,
  dropdownFooter,
  glass,
  className = "",
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPlacement, setDropdownPlacement] = useState<"top" | "bottom">(
    "bottom",
  );
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    visibility: "hidden",
  });
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const triggerGlassRef = useGlass<HTMLButtonElement>(glass, "input");
  const dropdownGlassRef = useGlass<HTMLUListElement>(glass, "input");
  const [activeIndex, setActiveIndex] = useState(-1);
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const listboxId = `${generatedId}-listbox`;

  const selectedLabel = useMemo(() => {
    const selectedOption = options.find((opt) => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  }, [value, options, placeholder]);

  const calculatePosition = useCallback(() => {
    if (!selectRef.current || !dropdownRef.current || !isOpen) return;
    const position = computeFloatingPosition({
      anchor: selectRef.current,
      floating: dropdownRef.current,
      matchWidth: true,
    });
    setDropdownPlacement(position.placement);
    setDropdownStyle(position.style);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (isOpen) {
      calculatePosition();
    } else {
      setDropdownStyle({ visibility: "hidden" });
    }
  }, [isOpen, calculatePosition, options.length, dropdownFooter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        (!dropdownRef.current ||
          !dropdownRef.current.contains(event.target as Node))
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    window.addEventListener("resize", calculatePosition);
    window.addEventListener("scroll", calculatePosition, true);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition, true);
    };
  }, [calculatePosition]);

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        const selected = options.findIndex(
          (option) => option.value === value && !option.disabled,
        );
        setActiveIndex(
          selected >= 0
            ? selected
            : options.findIndex((option) => !option.disabled),
        );
      }
      return next;
    });
  };

  const moveActive = (direction: 1 | -1) => {
    if (!options.length) return;
    let next = activeIndex;
    for (let count = 0; count < options.length; count += 1) {
      next = (next + direction + options.length) % options.length;
      if (!options[next]?.disabled) {
        setActiveIndex(next);
        requestAnimationFrame(() =>
          dropdownRef.current
            ?.querySelector<HTMLElement>(`[data-option-index="${next}"]`)
            ?.scrollIntoView({ block: "nearest" }),
        );
        return;
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (!isOpen) toggleDropdown();
      if (event.key === "ArrowDown") moveActive(1);
      else if (event.key === "ArrowUp") moveActive(-1);
      else {
        const indexes = options
          .map((option, index) => ({ option, index }))
          .filter(({ option }) => !option.disabled);
        setActiveIndex(
          event.key === "Home"
            ? (indexes[0]?.index ?? -1)
            : (indexes.at(-1)?.index ?? -1),
        );
      }
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isOpen) toggleDropdown();
      else if (activeIndex >= 0 && options[activeIndex])
        selectOption(options[activeIndex]);
    } else if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
    }
  };

  const selectOption = (option: VeySelectOption) => {
    if (disabled) return;
    if (option.disabled) {
      onOptionDisabled?.(option);
      return;
    }
    onChange?.(option.value);
    setIsOpen(false);
  };

  const handleDropdownScroll = (event: React.UIEvent<HTMLUListElement>) => {
    onDropdownScroll?.(event);

    const target = event.currentTarget;
    const distanceToBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight;
    if (distanceToBottom <= SCROLL_BOTTOM_THRESHOLD) {
      onDropdownReachBottom?.(event);
    }
  };

  return (
    <div
      className={`vl-select ${isOpen ? "is-open" : ""} ${disabled ? "is-disabled" : ""} ${className}`.trim()}
      ref={selectRef}
      {...rest}
    >
      <button
        ref={triggerGlassRef}
        id={resolvedId}
        type="button"
        className="vl-select-trigger"
        role="combobox"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
      >
        <span className="vl-select-label">{selectedLabel}</span>
        <span className="vl-select-arrow"></span>
      </button>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value ?? ""}
          disabled={disabled}
        />
      ) : null}

      {isOpen &&
        createPortal(
          <ul
            ref={(node) => {
              dropdownRef.current = node;
              dropdownGlassRef(node);
            }}
            id={listboxId}
            role="listbox"
            className="vl-select-options"
            style={dropdownStyle}
            data-placement={dropdownPlacement}
            onScroll={handleDropdownScroll}
          >
            {options.map((option, index) => {
              const isSelected = value === option.value;
              return (
                <li
                  key={option.value}
                  className={`vl-select-option ${isSelected ? "selected" : ""} ${option.disabled ? "disabled" : ""}`.trim()}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  data-option-index={index}
                  data-active={activeIndex === index || undefined}
                  title={option.hint}
                  onClick={() => selectOption(option)}
                >
                  {option.label}
                </li>
              );
            })}
            {dropdownFooter ? (
              <li className="vl-select-footer">{dropdownFooter}</li>
            ) : null}
          </ul>,
          document.body,
        )}
    </div>
  );
};
