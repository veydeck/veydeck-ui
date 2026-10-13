import { useEffect, useState } from "react";
import {
  VeyActionMenu,
  VeyButton,
  VeyCard,
  VeyCheckbox,
  VeyDialog,
  VeyGlassProvider,
  VeyGlassSurface,
  VeyInput,
  VeySelect,
  VeySwitch,
  VeyTable,
  VeyTabs,
  VeyTooltip,
  type VeyGlassOptions,
} from "@veydeck/react";
import "./GlassLab.css";

const rows = [
  { name: "Alpha", status: "在线" },
  { name: "Beta", status: "等待" },
];

/** React Liquid Glass 的交互与视觉验收页面。 */
export default function GlassLab() {
  const [enabled, setEnabled] = useState(true);
  const [dark, setDark] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [many, setMany] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [controls, setControls] = useState<Required<VeyGlassOptions>>({
    intensity: 1,
    refraction: 0.5,
    blur: 0.2,
    opacity: 0.3,
    highlight: 0.5,
  });
  const [selected, setSelected] = useState<string | number | null>("a");
  const [draft, setDraft] = useState("连接配置草稿");
  const [checked, setChecked] = useState(true);
  const [tab, setTab] = useState("overview");
  const [dialog, setDialog] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  const glass = enabled
    ? advanced
      ? controls
      : { intensity: controls.intensity }
    : false;
  const labels: Record<keyof Required<VeyGlassOptions>, string> = {
    intensity: "整体强度",
    refraction: "折射",
    blur: "模糊",
    opacity: "底色不透明度",
    highlight: "高光",
  };

  return (
    <main className="glass-lab" data-page="glass-lab">
      <header>
        <h1>Liquid Glass · React</h1>
        <p>React 19 材质接口、Portal 继承与资源生命周期验收。</p>
        <a href="/">全部组件</a>
      </header>
      <div className="glass-lab-layout">
        <aside aria-label="材质参数">
          <label>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
            />
            启用玻璃
          </label>
          <label>
            <input
              type="checkbox"
              checked={dark}
              onChange={(event) => setDark(event.target.checked)}
            />
            深色主题
          </label>
          <label>
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            独立参数覆盖
          </label>
          <label>
            <input
              type="checkbox"
              checked={many}
              onChange={(event) => setMany(event.target.checked)}
            />
            多实例压力场景
          </label>
          <label>
            <input
              type="checkbox"
              checked={mounted}
              onChange={(event) => setMounted(event.target.checked)}
            />
            挂载演示组件
          </label>
          {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => (
            <label key={key}>
              {labels[key]} <output>{controls[key].toFixed(2)}</output>
              <input
                aria-label={labels[key]}
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={controls[key]}
                disabled={key !== "intensity" && !advanced}
                onChange={(event) =>
                  setControls((current) => ({
                    ...current,
                    [key]: Number(event.target.value),
                  }))
                }
              />
            </label>
          ))}
          <pre>{JSON.stringify(glass, null, 2)}</pre>
        </aside>
        {mounted && (
          <VeyGlassProvider glass={glass}>
            <div className="glass-stage" data-ui="glass-stage">
              <div className="glass-background" aria-hidden="true">
                Veydeck
                <br />
                REACT 19
                <br />
                OBSERVABILITY
                <br />
                0123456789
              </div>
              <div className="glass-examples">
                <VeyGlassSurface
                  as="section"
                  className="custom-shell"
                  data-ui="glass-surface"
                >
                  自绘产品壳层
                </VeyGlassSurface>
                <VeyButton data-ui="glass-button">
                  <span className="foreground-probe" data-ui="foreground-probe">
                    保存配置
                  </span>
                </VeyButton>
                <VeyButton type="primary">主要操作</VeyButton>
                <VeyButton glass={false}>实色覆盖</VeyButton>
                <VeyCard header="节点状态" data-ui="glass-card">
                  连接正常 · 192.168.1.10
                </VeyCard>
                <VeySelect
                  value={selected}
                  options={[
                    { label: "节点 Alpha", value: "a" },
                    { label: "节点 Beta", value: "b" },
                  ]}
                  ariaLabel="选择节点"
                  data-ui="glass-select"
                  onChange={setSelected}
                />
                <VeyInput
                  value={draft}
                  ariaLabel="配置草稿"
                  onChange={setDraft}
                />
                <div className="glass-control-row">
                  <VeySwitch
                    value={checked}
                    activeText="自动连接"
                    onChange={setChecked}
                  />
                  <VeyCheckbox checked={checked} onChange={setChecked}>
                    已选择
                  </VeyCheckbox>
                </div>
                <VeyTabs
                  value={tab}
                  tabs={[
                    { name: "overview", label: "概览" },
                    { name: "settings", label: "设置" },
                  ]}
                  onChange={setTab}
                />
                <div className="glass-control-row">
                  <VeyActionMenu
                    label="更多操作"
                    actions={[
                      { label: "查看详情", handler: () => setDialog(true) },
                    ]}
                  />
                  <VeyTooltip text="浮层继承材质与主题">
                    <VeyButton onClick={() => setDialog(true)}>
                      打开详情
                    </VeyButton>
                  </VeyTooltip>
                </div>
                <VeyTable
                  data={rows}
                  columns={[
                    { prop: "name", label: "节点" },
                    { prop: "status", label: "状态" },
                  ]}
                />
                {many && (
                  <div className="glass-stress" data-ui="glass-stress">
                    {Array.from({ length: 24 }, (_, index) => (
                      <VeyButton key={index}>节点 {index + 1}</VeyButton>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <VeyDialog
              visible={dialog}
              title="节点详情"
              onClose={() => setDialog(false)}
            >
              <VeyInput
                value={draft}
                ariaLabel="详情草稿"
                onChange={setDraft}
              />
              <p>材质调整保留输入、焦点与浮层状态。</p>
            </VeyDialog>
          </VeyGlassProvider>
        )}
      </div>
    </main>
  );
}
