import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { computeFloatingPosition } from "../../internal/floating-position";
import type { VeyGlassValue } from "../../glass";
import { useGlass } from "../../internal/use-glass";
import "./VeyDateTimeRangePicker.css";

export interface DateTimeRangeValue {
  startAt: number | null;
  endAt: number | null;
}

export interface ShortcutOption {
  label: string;
  value: "15m" | "1h" | "24h" | "7d" | "today";
}

export interface VeyDateTimeRangePickerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "value" | "onChange"
> {
  /** 绑定的时间范围，使用 Unix epoch milliseconds */
  value: DateTimeRangeValue;
  /** 占位文案 */
  placeholder?: string;
  /** 起始端标签 */
  startLabel?: string;
  /** 结束端标签 */
  endLabel?: string;
  /** 快捷范围标题 */
  shortcutsLabel?: string;
  /** 日历标题 */
  calendarLabel?: string;
  /** 时间标题 */
  timeLabel?: string;
  /** 清空按钮文案 */
  clearLabel?: string;
  /** 确认按钮文案 */
  confirmLabel?: string;
  /** 取消按钮文案 */
  cancelLabel?: string;
  /** 当前应用语言 */
  locale?: string;
  /** 星期标题，长度为 7 */
  weekDays?: string[];
  /** 快捷范围选项 */
  shortcuts?: ShortcutOption[];
  /** 是否禁用 */
  disabled?: boolean;
  /** 改变值时的回调 */
  onChange?: (value: DateTimeRangeValue) => void;
  /** 点击确认应用时的回调 */
  onApply?: (value: DateTimeRangeValue) => void;
  /** 液态玻璃材质配置 */
  glass?: VeyGlassValue;
}

// --- Date Utils ---
function timestampToDate(value: number | null | undefined) {
  return value ? new Date(value) : new Date();
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
}

function endOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatDateTime(value: number | null) {
  if (!value) return "--";
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function normalizeRange(value: DateTimeRangeValue): DateTimeRangeValue {
  const startAt = value.startAt ?? null;
  const endAt = value.endAt ?? null;

  if (startAt !== null && endAt !== null && startAt > endAt) {
    return { startAt: endAt, endAt: startAt };
  }

  return { startAt, endAt };
}

const DEFAULT_SHORTCUTS: ShortcutOption[] = [
  { label: "最近 15 分钟", value: "15m" },
  { label: "最近 1 小时", value: "1h" },
  { label: "最近 24 小时", value: "24h" },
  { label: "最近 7 天", value: "7d" },
  { label: "今天", value: "today" },
];

export const VeyDateTimeRangePicker: React.FC<VeyDateTimeRangePickerProps> = ({
  value,
  placeholder = "请选择时间范围",
  startLabel = "开始时间",
  endLabel = "结束时间",
  shortcutsLabel = "常用范围",
  calendarLabel = "选择日期",
  timeLabel = "选择时间",
  clearLabel = "清空",
  confirmLabel = "确定",
  cancelLabel = "取消",
  locale = "zh",
  weekDays = ["日", "一", "二", "三", "四", "五", "六"],
  shortcuts = DEFAULT_SHORTCUTS,
  disabled = false,
  onChange,
  onApply,
  glass,
  className = "",
  ...rest
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerGlassRef = useGlass<HTMLButtonElement>(glass, "input");
  const panelGlassRef = useGlass<HTMLDivElement>(glass, "input");
  const [isOpen, setIsOpen] = useState(false);
  const [activeBoundary, setActiveBoundary] = useState<"start" | "end">(
    "start",
  );
  const [draft, setDraft] = useState<DateTimeRangeValue>(() =>
    normalizeRange(value),
  );
  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    startOfMonth(new Date()),
  );
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const [panelPlacement, setPanelPlacement] = useState<"top" | "bottom">(
    "bottom",
  );

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, index) => index),
    [],
  );
  const minutes = useMemo(
    () => Array.from({ length: 12 }, (_, index) => index * 5),
    [],
  );

  const displayText = useMemo(() => {
    if (!value.startAt && !value.endAt) return placeholder;
    return `${formatDateTime(value.startAt)} - ${formatDateTime(value.endAt)}`;
  }, [value, placeholder]);

  const activeDate = useMemo(() => {
    const key = activeBoundary === "start" ? "startAt" : "endAt";
    return timestampToDate(draft[key]);
  }, [draft, activeBoundary]);

  const activeHour = activeDate.getHours();
  const activeMinute = Math.floor(activeDate.getMinutes() / 5) * 5;

  const calendarTitle = useMemo(() => {
    return visibleMonth.toLocaleDateString(
      locale === "zh" ? "zh-CN" : "en-US",
      {
        year: "numeric",
        month: "long",
      },
    );
  }, [visibleMonth, locale]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth);
    const firstDay = monthStart.getDay();
    const gridStart = addDays(monthStart, -firstDay);

    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(gridStart, index);
      const timestamp = date.getTime();
      const start = draft.startAt
        ? startOfDay(new Date(draft.startAt)).getTime()
        : null;
      const end = draft.endAt
        ? startOfDay(new Date(draft.endAt)).getTime()
        : null;
      const rangeStart =
        start !== null && end !== null ? Math.min(start, end) : null;
      const rangeEnd =
        start !== null && end !== null ? Math.max(start, end) : null;

      return {
        date,
        key: toDateKey(date),
        label: String(date.getDate()),
        muted: date.getMonth() !== visibleMonth.getMonth(),
        today: toDateKey(date) === toDateKey(new Date()),
        selectedStart: start === timestamp,
        selectedEnd: end === timestamp,
        inRange:
          rangeStart !== null &&
          rangeEnd !== null &&
          timestamp > rangeStart &&
          timestamp < rangeEnd,
      };
    });
  }, [visibleMonth, draft]);

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || !panelRef.current) return;
    const position = computeFloatingPosition({
      anchor: trigger,
      floating: panelRef.current,
      gap: 8,
      maxHeight: window.innerHeight - 16,
    });
    setPanelPlacement(position.placement);
    setPanelStyle({
      ...position.style,
      width: `${Math.min(620, window.innerWidth - 16)}px`,
    });
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      )
        return;
      closePanel();
    },
    [closePanel],
  );

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    },
    [closePanel],
  );

  useEffect(() => {
    if (!isOpen) {
      setDraft(normalizeRange(value));
    }
  }, [value, isOpen]);

  useEffect(() => {
    if (isOpen) {
      updatePanelPosition();
      window.addEventListener("resize", updatePanelPosition);
      window.addEventListener("scroll", updatePanelPosition, true);
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeydown);
    }

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [isOpen, updatePanelPosition, handleOutsideClick, handleKeydown]);

  const openPanel = () => {
    if (disabled) return;
    const initialDraft = normalizeRange(value);
    setDraft(initialDraft);
    const anchor = initialDraft.startAt ?? initialDraft.endAt ?? Date.now();
    setVisibleMonth(startOfMonth(new Date(anchor)));
    setIsOpen(true);
  };

  const shiftMonth = (offset: number) => {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  const setBoundaryDate = (date: Date) => {
    const current = activeDate;
    const next = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      current.getHours(),
      current.getMinutes(),
      0,
      0,
    );
    const key = activeBoundary === "start" ? "startAt" : "endAt";
    setDraft((prev) =>
      normalizeRange({
        ...prev,
        [key]: next.getTime(),
      }),
    );
  };

  const setBoundaryTime = (hour: number, minute: number) => {
    const current = activeDate;
    const next = new Date(
      current.getFullYear(),
      current.getMonth(),
      current.getDate(),
      hour,
      minute,
      0,
      0,
    );
    const key = activeBoundary === "start" ? "startAt" : "endAt";
    setDraft((prev) =>
      normalizeRange({
        ...prev,
        [key]: next.getTime(),
      }),
    );
  };

  const applyShortcut = (shortcutValue: ShortcutOption["value"]) => {
    const now = new Date();
    let next: DateTimeRangeValue;

    if (shortcutValue === "today") {
      next = {
        startAt: startOfDay(now).getTime(),
        endAt: endOfDay(now).getTime(),
      };
    } else {
      const spanMap = {
        "15m": 15 * 60 * 1000,
        "1h": 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
      };
      next = {
        startAt: now.getTime() - spanMap[shortcutValue],
        endAt: now.getTime(),
      };
    }

    setDraft(next);
    setVisibleMonth(startOfMonth(new Date(next.startAt ?? Date.now())));
  };

  const clearRange = () => {
    const empty = { startAt: null, endAt: null };
    setDraft(empty);
    onChange?.(empty);
    onApply?.(empty);
    closePanel();
  };

  const confirmRange = () => {
    const next = normalizeRange(draft);
    onChange?.(next);
    onApply?.(next);
    closePanel();
  };

  return (
    <div
      className={`vl-date-time-range-picker ${className}`.trim()}
      data-ui="date-time-range-picker"
      {...rest}
    >
      <button
        ref={(node) => {
          triggerRef.current = node;
          triggerGlassRef(node);
        }}
        type="button"
        className={`range-trigger ${!value.startAt && !value.endAt ? "is-placeholder" : ""}`.trim()}
        disabled={disabled}
        onClick={() => (isOpen ? closePanel() : openPanel())}
      >
        <span className="trigger-text">{displayText}</span>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={(node) => {
              panelRef.current = node;
              panelGlassRef(node);
            }}
            className="range-panel"
            style={panelStyle}
            data-placement={panelPlacement}
          >
            <aside className="shortcut-column">
              <div className="panel-title">{shortcutsLabel}</div>
              {shortcuts.map((shortcut) => (
                <button
                  key={shortcut.value}
                  type="button"
                  className="shortcut-button"
                  onClick={() => applyShortcut(shortcut.value)}
                >
                  {shortcut.label}
                </button>
              ))}
            </aside>

            <section className="calendar-column">
              <div className="panel-title">{calendarLabel}</div>
              <div className="boundary-switch">
                <button
                  type="button"
                  className={`boundary-button ${activeBoundary === "start" ? "is-active" : ""}`.trim()}
                  onClick={() => setActiveBoundary("start")}
                >
                  <span>{startLabel}</span>
                  <strong>{formatDateTime(draft.startAt)}</strong>
                </button>
                <button
                  type="button"
                  className={`boundary-button ${activeBoundary === "end" ? "is-active" : ""}`.trim()}
                  onClick={() => setActiveBoundary("end")}
                >
                  <span>{endLabel}</span>
                  <strong>{formatDateTime(draft.endAt)}</strong>
                </button>
              </div>

              <div className="calendar-header">
                <button
                  type="button"
                  className="month-button"
                  onClick={() => shiftMonth(-1)}
                >
                  ‹
                </button>
                <span>{calendarTitle}</span>
                <button
                  type="button"
                  className="month-button"
                  onClick={() => shiftMonth(1)}
                >
                  ›
                </button>
              </div>

              <div className="week-grid">
                {weekDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="day-grid">
                {calendarDays.map((day) => (
                  <button
                    key={day.key}
                    type="button"
                    className={`day-button ${day.muted ? "is-muted" : ""} ${day.today ? "is-today" : ""} ${day.selectedStart ? "is-selected-start" : ""} ${day.selectedEnd ? "is-selected-end" : ""} ${day.inRange ? "is-in-range" : ""}`.trim()}
                    onClick={() => setBoundaryDate(day.date)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="time-column">
              <div className="panel-title">{timeLabel}</div>
              <div className="time-lists">
                <div className="time-list">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      className={`time-option ${activeHour === hour ? "is-active" : ""}`.trim()}
                      onClick={() => setBoundaryTime(hour, activeMinute)}
                    >
                      {String(hour).padStart(2, "0")}
                    </button>
                  ))}
                </div>
                <div className="time-list">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      className={`time-option ${activeMinute === minute ? "is-active" : ""}`.trim()}
                      onClick={() => setBoundaryTime(activeHour, minute)}
                    >
                      {String(minute).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <footer className="panel-actions">
              <button
                type="button"
                className="text-button"
                onClick={clearRange}
              >
                {clearLabel}
              </button>
              <span className="action-spacer"></span>
              <button
                type="button"
                className="text-button"
                onClick={closePanel}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className="confirm-button"
                onClick={confirmRange}
              >
                {confirmLabel}
              </button>
            </footer>
          </div>,
          document.body,
        )}
    </div>
  );
};
