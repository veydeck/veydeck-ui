<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  VeyButton,
  VeyInput,
  VeySwitch,
  VeyTag,
  VeyIcon,
  VeyCard,
  VeyCheckbox,
  VeyEmpty,
  VeyAlert,
  VeyLoading,
  VeyBreadcrumb,
  VeyBreadcrumbItem,
  VeyToast,
  VeyTooltip,
  ToastItem,
  VeyDescriptions,
  VeyFormItem,
  VeyTabs,
  VeyMenu,
  VeyActionMenu,
  VeyDialog,
  VeyDrawer,
  VeyModal,
  VeyPagination,
  VeySelect,
  VeyTable,
  VeyDateTimeRangePicker,
} from "@veydeck/vue";

const componentAnchors = [
  ["button", "Button", "按钮"],
  ["input", "Input", "输入框"],
  ["switch", "Switch", "开关"],
  ["tag", "Tag", "标签"],
  ["icon", "Icon", "图标"],
  ["card", "Card", "卡片"],
  ["checkbox", "Checkbox", "复选框"],
  ["alert", "Alert", "警告横幅"],
  ["empty", "Empty", "空状态"],
  ["loading", "Loading", "加载状态"],
  ["breadcrumb", "Breadcrumb", "面包屑"],
  ["tooltip", "Tooltip", "文字提示"],
  ["toast", "Toast", "通知"],
  ["tabs", "Tabs", "标签页"],
  ["action-menu", "ActionMenu", "操作菜单"],
  ["menu", "Menu", "菜单"],
  ["descriptions", "Descriptions", "描述列表"],
  ["form-item", "FormItem", "表单项"],
  ["dialog", "Dialog", "对话框"],
  ["drawer", "Drawer", "抽屉"],
  ["modal", "Modal", "模态框"],
  ["select", "Select", "选择器"],
  ["pagination", "Pagination", "分页"],
  ["date-time-range-picker", "DateTimeRangePicker", "时间范围"],
  ["table", "Table", "表格"],
].map(([id, name, label]) => ({ id, name, label }));

const activeAnchor = ref(componentAnchors[0].id);
let anchorObserver: IntersectionObserver | undefined;

onMounted(() => {
  const hash = window.location.hash.slice(1).replace("component-", "");
  if (componentAnchors.some((item) => item.id === hash))
    activeAnchor.value = hash;

  anchorObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      const id = visible?.target.id.replace("component-", "");
      if (!id) return;
      activeAnchor.value = id;
      window.history.replaceState(null, "", `#component-${id}`);
    },
    { rootMargin: "0px 0px -70% 0px", threshold: 0 },
  );

  componentAnchors.forEach((item) => {
    const target = document.getElementById(`component-${item.id}`);
    if (target) anchorObserver?.observe(target);
  });
});

onBeforeUnmount(() => anchorObserver?.disconnect());

const textVal = ref("Hello Veydeck UI");
const switchVal = ref(true);
const checkboxVal = ref(false);
const loadingVal = ref(false);

// Dialog / Drawer / Modal trigger states
const dialogVisible = ref(false);
const drawerVisible = ref(false);
const modalVisible = ref(false);

// Pagination & Select states
const currentPageVal = ref(1);
const totalPagesVal = ref(10);
const selectVal = ref("opt1");
const selectOptions = [
  {
    value: "opt1",
    label: "主要通信节点 (Primary)",
    hint: "运行主力防火墙策略",
  },
  { value: "opt2", label: "备用节点 A (Backup A)" },
  {
    value: "opt3",
    label: "只读节点 B (Readonly B)",
    disabled: true,
    hint: "处于离线维护状态",
  },
];

// Table mock data and columns
const tableData = ref([
  {
    id: "1",
    name: "网络边界防火墙 A",
    ip: "10.0.1.100",
    status: "active",
    traffic: "1.2 Gbps",
  },
  {
    id: "2",
    name: "数据中心路由器 B",
    ip: "10.0.2.1",
    status: "active",
    traffic: "850 Mbps",
  },
  {
    id: "3",
    name: "入侵检测系统 C",
    ip: "10.0.5.50",
    status: "maintenance",
    traffic: "0 bps",
  },
]);

const tableColumns = [
  { prop: "name", label: "节点名称", width: "200px" },
  { prop: "ip", label: "节点 IP", width: "150px" },
  { prop: "traffic", label: "当前流量", width: "120px" },
  { slot: "status", label: "运行状态", width: "120px" },
  { slot: "actions", label: "操作", width: "100px" },
];

// Date picker states
const rangeVal = ref({
  startAt: new Date(2025, 4, 20, 9, 30).getTime(),
  endAt: new Date(2025, 4, 20, 10, 30).getTime(),
});

const shortcutOptions = [
  { label: "最近 15 分钟", value: "15m" as const },
  { label: "最近 1 小时", value: "1h" as const },
  { label: "最近 24 小时", value: "24h" as const },
  { label: "最近 7 天", value: "7d" as const },
  { label: "今天", value: "today" as const },
];

const weekDaysList = ["日", "一", "二", "三", "四", "五", "六"];

// Tabs active state
const activeTab = ref("tab1");
const tabsList = [
  { label: "基础配置", name: "tab1" },
  { label: "高级设置", name: "tab2" },
  { label: "只读历史", name: "tab3", disabled: true },
];

// Menu active state & categories
const activeMenu = ref("item1");
const menuItems = [
  {
    key: "group1",
    label: "核心资源",
    children: [
      { key: "item1", label: "容器管理" },
      { key: "item2", label: "镜像仓库" },
    ],
  },
  {
    key: "group2",
    label: "高级功能",
    children: [
      { key: "item3", label: "负载均衡" },
      { key: "item4", label: "审计日志" },
    ],
  },
];

// Descriptions items & mock data
const descItems = [
  { label: "服务名称", value: "Security Core Services" },
  { label: "当前版本", value: "v2.4.12-release" },
  { label: "状态", slot: "status" },
  { label: "节点数", value: 8, span: 1 },
  {
    label: "备注信息",
    value:
      "This cluster runs core node authentication and firewall dispatch policies.",
    span: 2,
  },
];
const descData = {
  statusText: "正常运行",
};

// ActionMenu actions list
const actionsList = [
  {
    label: "启动服务",
    icon: "status-running",
    className: "app-btn-start",
    handler: () => {
      addToast("success", "指令已发送", "服务启动指令下发成功。");
    },
  },
  {
    label: "暂停服务",
    icon: "settings",
    className: "app-btn-stop",
    handler: () => {
      addToast("warning", "指令已发送", "服务暂停指令下发成功。");
    },
  },
  {
    label: "删除容器",
    icon: "trash",
    className: "app-btn-delete",
    handler: () => {
      addToast("error", "删除警告", "此操作无法撤销。");
    },
  },
];

function triggerLoading() {
  loadingVal.value = true;
  setTimeout(() => {
    loadingVal.value = false;
  }, 2000);
}

// Toast demonstration state
const toasts = ref<ToastItem[]>([]);

function addToast(type: ToastItem["type"], title: string, message: string) {
  const id = Math.random().toString(36).substring(2, 9);
  toasts.value.push({ id, type, title, message });

  // Auto-remove in 3s
  setTimeout(() => {
    removeToast(id);
  }, 3000);
}

function removeToast(id: string) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

// Theme switching logic
const theme = ref("light");
document.documentElement.setAttribute("data-theme", theme.value);

function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme.value);
}
</script>

<template>
  <div class="playground-wrapper">
    <header class="playground-header">
      <div>
        <h2>Veydeck UI Component Workspace</h2>
        <p>调试设计语言 tokens、自研图标及基础 UI 组件</p>
      </div>
      <VeyButton type="primary" @click="toggleTheme">
        切换为 {{ theme === "dark" ? "明亮" : "暗黑" }} 主题
      </VeyButton>
    </header>

    <div class="playground-layout">
      <aside class="component-anchor-sidebar" data-ui="component-anchor-menu">
        <div class="component-anchor-title">组件目录</div>
        <nav class="component-anchor-nav">
          <a
            v-for="item in componentAnchors"
            :key="item.id"
            :href="`#component-${item.id}`"
            :class="{ active: activeAnchor === item.id }"
            @click="activeAnchor = item.id"
          >
            <span>{{ item.name }}</span>
            <span>{{ item.label }}</span>
          </a>
        </nav>
      </aside>

      <main class="playground-content">
        <!-- Buttons section -->
        <section id="component-button" class="card component-anchor-target">
          <h3>Buttons 按钮</h3>
          <div class="row">
            <VeyButton type="primary">主要按钮 (Primary)</VeyButton>
            <VeyButton type="secondary">次要按钮 (Secondary)</VeyButton>
            <VeyButton type="danger">危险按钮 (Danger)</VeyButton>
            <VeyButton type="warning">警告按钮 (Warning)</VeyButton>
            <VeyButton type="info">信息按钮 (Info)</VeyButton>
          </div>
          <div class="row">
            <VeyButton type="primary" size="small">小型按钮</VeyButton>
            <VeyButton type="primary">默认按钮</VeyButton>
            <VeyButton type="primary" size="large">大型按钮</VeyButton>
            <VeyButton type="primary" disabled>禁用按钮</VeyButton>
            <VeyButton type="primary" loading>加载中</VeyButton>
          </div>
        </section>

        <!-- Input section -->
        <section id="component-input" class="card component-anchor-target">
          <h3>Inputs 输入框</h3>
          <div
            class="row"
            style="
              flex-direction: column;
              align-items: stretch;
              max-width: 400px;
            "
          >
            <div class="form-item">
              <label>常规文本输入框</label>
              <VeyInput v-model="textVal" placeholder="请输入内容" />
              <span class="hint">当前输入值: {{ textVal }}</span>
            </div>

            <div class="form-item">
              <label>密码输入框</label>
              <VeyInput
                v-model="textVal"
                type="password"
                show-password
                placeholder="请输入密码"
              />
            </div>

            <div class="form-item">
              <label>多行文本输入框</label>
              <VeyInput
                v-model="textVal"
                type="textarea"
                :rows="3"
                placeholder="请输入详细描述"
              />
            </div>
          </div>
        </section>

        <!-- Switch section -->
        <section id="component-switch" class="card component-anchor-target">
          <h3>Switches 开关</h3>
          <div class="row">
            <VeySwitch v-model="switchVal" active-text="系统功能开关" />
            <VeySwitch :model-value="false" disabled active-text="禁用未激活" />
            <VeySwitch :model-value="true" disabled active-text="禁用激活" />
          </div>
        </section>

        <!-- Tags section -->
        <section id="component-tag" class="card component-anchor-target">
          <h3>Tags 标签</h3>
          <div class="row">
            <VeyTag type="default">默认标签</VeyTag>
            <VeyTag type="primary">主要标签</VeyTag>
            <VeyTag type="success">成功标签</VeyTag>
            <VeyTag type="warning">警告标签</VeyTag>
            <VeyTag type="danger">危险标签</VeyTag>
            <VeyTag type="info">信息标签</VeyTag>
          </div>
        </section>

        <!-- Icons section -->
        <section id="component-icon" class="card component-anchor-target">
          <h3>Icons 矢量图标</h3>
          <div class="row icons-grid">
            <div class="icon-item">
              <VeyIcon name="desktop" :size="24" />
              <span>desktop</span>
            </div>
            <div class="icon-item">
              <VeyIcon name="settings" :size="24" />
              <span>settings</span>
            </div>
            <div class="icon-item">
              <VeyIcon name="lock" :size="24" />
              <span>lock</span>
            </div>
            <div class="icon-item">
              <VeyIcon name="trash" :size="24" />
              <span>trash</span>
            </div>
            <div class="icon-item">
              <VeyIcon name="terminal" :size="24" />
              <span>terminal</span>
            </div>
            <div class="icon-item">
              <VeyIcon name="copy" :size="24" />
              <span>copy</span>
            </div>
            <div class="icon-item">
              <VeyIcon name="error" :size="24" />
              <span>error</span>
            </div>
            <div class="icon-item">
              <VeyIcon name="status-running" :size="24" />
              <span>running</span>
            </div>
          </div>
        </section>

        <!-- Cards section -->
        <section id="component-card" class="card component-anchor-target">
          <h3>Cards 卡片</h3>
          <div class="row" style="align-items: stretch">
            <VeyCard style="width: 280px" shadow="always">
              <template #header>总是显示阴影 (always)</template>
              <div>这是卡片主体内容，遵循 VDL 设计规范。</div>
            </VeyCard>
            <VeyCard style="width: 280px" shadow="hover">
              <template #header>悬浮显示阴影 (hover)</template>
              <div>鼠标悬浮时才显示卡片投影效果。</div>
            </VeyCard>
            <VeyCard style="width: 280px" shadow="never">
              <template #header>从不显示阴影 (never)</template>
              <div>纯扁平无阴影样式的卡片容器。</div>
            </VeyCard>
          </div>
        </section>

        <!-- Checkbox section -->
        <section id="component-checkbox" class="card component-anchor-target">
          <h3>Checkboxes 复选框</h3>
          <div class="row">
            <VeyCheckbox v-model="checkboxVal">
              默认复选框 (值: {{ checkboxVal }})
            </VeyCheckbox>
            <VeyCheckbox :model-value="true" disabled> 禁用已勾选 </VeyCheckbox>
            <VeyCheckbox :model-value="false" disabled>
              禁用未勾选
            </VeyCheckbox>
          </div>
        </section>

        <!-- Alert section -->
        <section id="component-alert" class="card component-anchor-target">
          <h3>Alerts 警告横幅</h3>
          <div
            class="row"
            style="flex-direction: column; align-items: stretch; gap: 16px"
          >
            <VeyAlert
              type="info"
              show-icon
              title="提示信息"
              description="这是一条普通的提示信息横幅。"
            />
            <VeyAlert
              type="success"
              show-icon
              title="成功提示"
              description="操作已成功完成，系统已更新。"
              closable
            />
            <VeyAlert
              type="warning"
              show-icon
              title="警告提示"
              description="此操作可能影响系统的正常运行，请谨慎操作。"
            />
            <VeyAlert
              type="error"
              show-icon
              title="错误提示"
              description="系统连接超时，请检查网络设置后重试。"
              closable
            />
          </div>
        </section>

        <!-- Loading and Empty section -->
        <section class="card">
          <h3>Loading & Empty 加载与空状态</h3>
          <div class="row" style="justify-content: space-around; width: 100%">
            <div id="component-empty" class="component-anchor-target">
              <VeyCard style="width: 320px">
                <template #header>空状态示例</template>
                <VeyEmpty description="自定义暂无数据文案">
                  <template #extra>
                    <VeyButton type="primary" size="small">重新加载</VeyButton>
                  </template>
                </VeyEmpty>
              </VeyCard>
            </div>

            <div id="component-loading" class="component-anchor-target">
              <VeyCard style="width: 320px">
                <template #header>加载中遮罩</template>
                <VeyLoading :loading="loadingVal" text="正在拼命加载中...">
                  <div style="padding: 40px 20px; text-align: center">
                    <p>点击下方按钮体验局部 Loading 遮罩</p>
                    <VeyButton
                      type="primary"
                      size="small"
                      @click="triggerLoading"
                    >
                      触发 2 秒 Loading
                    </VeyButton>
                  </div>
                </VeyLoading>
              </VeyCard>
            </div>

            <VeyCard style="width: 320px">
              <template #header>覆盖层级回归</template>
              <div
                data-ui="qa-loading-cover"
                style="
                  position: relative;
                  height: 96px;
                  overflow: hidden;
                  border: 1px solid var(--vdl-border-default);
                  border-radius: var(--vdl-radius-md);
                  background: var(--vdl-bg-muted);
                "
              >
                <div
                  data-slot="sticky-content"
                  style="
                    position: sticky;
                    top: 0;
                    z-index: 30;
                    height: 40px;
                    display: grid;
                    place-items: center;
                    color: var(--vdl-text-primary);
                    background: var(--vdl-bg-panel);
                  "
                >
                  高层级粘性内容
                </div>
                <VeyLoading loading cover text="正在加载..." />
              </div>
            </VeyCard>
          </div>
        </section>

        <!-- Navigation & Popups (Breadcrumb, Tooltip, Toast) -->
        <section class="card">
          <h3>
            Navigation & Popups (Breadcrumb, Tooltip, Toast) 面包屑、提示、通知
          </h3>

          <!-- Breadcrumb section -->
          <div
            id="component-breadcrumb"
            class="row component-anchor-target"
            style="flex-direction: column; align-items: flex-start; gap: 8px"
          >
            <label
              style="
                font-size: 13px;
                color: var(--vdl-text-secondary);
                font-weight: 500;
              "
              >面包屑导航</label
            >
            <VeyBreadcrumb>
              <VeyBreadcrumbItem>首页</VeyBreadcrumbItem>
              <VeyBreadcrumbItem>系统管理</VeyBreadcrumbItem>
              <VeyBreadcrumbItem>安全配置</VeyBreadcrumbItem>
            </VeyBreadcrumb>
          </div>

          <hr
            style="
              border: none;
              border-top: 1px solid var(--vdl-border-default);
              width: 100%;
              margin: 8px 0;
            "
          />

          <!-- Tooltip section -->
          <div
            id="component-tooltip"
            class="row component-anchor-target"
            style="flex-direction: column; align-items: flex-start; gap: 12px"
          >
            <label
              style="
                font-size: 13px;
                color: var(--vdl-text-secondary);
                font-weight: 500;
              "
              >文字提示 (Tooltip)</label
            >
            <div class="row">
              <VeyTooltip
                data-ui="qa-tooltip"
                text="这里是上方的提示内容"
                position="top"
              >
                <VeyButton size="small">上方提示</VeyButton>
              </VeyTooltip>
              <VeyTooltip text="这里是下方的提示内容" position="bottom">
                <VeyButton size="small">下方提示</VeyButton>
              </VeyTooltip>
              <VeyTooltip text="这里是左侧的提示内容" position="left">
                <VeyButton size="small">左侧提示</VeyButton>
              </VeyTooltip>
              <VeyTooltip text="这里是右侧的提示内容" position="right">
                <VeyButton size="small">右侧提示</VeyButton>
              </VeyTooltip>
            </div>
          </div>

          <hr
            style="
              border: none;
              border-top: 1px solid var(--vdl-border-default);
              width: 100%;
              margin: 8px 0;
            "
          />

          <!-- Toast section -->
          <div
            id="component-toast"
            class="row component-anchor-target"
            style="flex-direction: column; align-items: flex-start; gap: 12px"
          >
            <label
              style="
                font-size: 13px;
                color: var(--vdl-text-secondary);
                font-weight: 500;
              "
              >通知提示 (Toast)</label
            >
            <div class="row">
              <VeyButton
                type="primary"
                size="small"
                @click="
                  addToast(
                    'success',
                    '成功通知',
                    '这是一条操作成功的消息提示，3秒后自动消失。',
                  )
                "
              >
                触发成功通知
              </VeyButton>
              <VeyButton
                type="danger"
                size="small"
                @click="
                  addToast(
                    'error',
                    '错误通知',
                    '系统遭遇异常，请查看审计日志。',
                  )
                "
              >
                触发错误通知
              </VeyButton>
              <VeyButton
                type="warning"
                size="small"
                @click="
                  addToast(
                    'warning',
                    '警告通知',
                    '磁盘空间不足，请及时清理缓存文件。',
                  )
                "
              >
                触发警告通知
              </VeyButton>
              <VeyButton
                type="info"
                size="small"
                @click="
                  addToast(
                    'info',
                    '常规通知',
                    '系统于今晚 24:00 进行常规维护升级。',
                  )
                "
              >
                触发常规通知
              </VeyButton>
            </div>
            <!-- Real time toast renderer -->
            <VeyToast :toasts="toasts" @close="removeToast" />
          </div>
        </section>

        <!-- Layout & Controls (Tabs, Menu, Descriptions, FormItem, ActionMenu) -->
        <section class="card">
          <h3>Layout & Controls 布局与控制组件</h3>

          <!-- Tabs & ActionMenu demo -->
          <div
            class="row"
            style="
              justify-content: space-between;
              width: 100%;
              align-items: flex-end;
            "
          >
            <div
              id="component-tabs"
              class="component-anchor-target"
              style="flex: 1; max-width: 500px"
            >
              <VeyTabs data-ui="qa-tabs" v-model="activeTab" :tabs="tabsList" />
            </div>
            <div id="component-action-menu" class="component-anchor-target">
              <VeyActionMenu
                data-ui="qa-action-menu"
                :actions="actionsList"
                label="管理操作"
              />
            </div>
          </div>

          <div style="padding: 12px 0">
            <p
              v-if="activeTab === 'tab1'"
              style="font-size: 13px; color: var(--vdl-text-secondary)"
            >
              [基础配置] 标签页激活。下方是详情列表与表单展示：
            </p>
            <p
              v-else-if="activeTab === 'tab2'"
              style="font-size: 13px; color: var(--vdl-text-secondary)"
            >
              [高级设置] 标签页激活。可以在此处设置高吞吐防火墙规则。
            </p>
          </div>

          <div
            class="row"
            style="align-items: flex-start; gap: 24px; width: 100%"
          >
            <!-- Menu demo on left -->
            <div
              id="component-menu"
              class="component-anchor-target"
              style="
                width: 200px;
                flex-shrink: 0;
                background-color: var(--vdl-bg-panel);
                border: 1px solid var(--vdl-border-default);
                border-radius: var(--vdl-radius-md);
                padding: 12px;
              "
            >
              <VeyMenu
                data-ui="qa-menu"
                v-model="activeMenu"
                :items="menuItems"
              />
            </div>

            <!-- Descriptions & Form demo on right -->
            <div
              style="flex: 1; display: flex; flex-direction: column; gap: 20px"
            >
              <div id="component-descriptions" class="component-anchor-target">
                <VeyCard shadow="never" style="padding: 16px">
                  <template #header>服务状态详情列表 (Descriptions)</template>
                  <VeyDescriptions
                    :items="descItems"
                    :data="descData"
                    :column="2"
                    border
                  >
                    <template #status="{ data }">
                      <VeyTag type="success">{{ data?.statusText }}</VeyTag>
                    </template>
                  </VeyDescriptions>
                </VeyCard>
              </div>

              <div id="component-form-item" class="component-anchor-target">
                <VeyCard shadow="never" style="padding: 16px">
                  <template #header>表单项配置 (FormItem)</template>
                  <VeyFormItem
                    data-ui="qa-form-error"
                    label="目标节点地址"
                    required
                    hint="请填写合法的 IPv4/IPv6 节点通信地址"
                    error="示例错误：请输入合法的节点地址"
                  >
                    <VeyInput
                      v-model="textVal"
                      placeholder="例如 192.168.1.100"
                    />
                  </VeyFormItem>
                  <VeyFormItem
                    label="启用节点自动备份"
                    hint="每天凌晨 02:00 自动冷备份"
                  >
                    <VeySwitch :model-value="true" />
                  </VeyFormItem>
                </VeyCard>
              </div>
            </div>
          </div>
        </section>

        <!-- Overlays & Popups (Dialog, Drawer, Modal) -->
        <section class="card">
          <h3>Overlays & Popups 弹窗、抽屉与模态框</h3>
          <div class="row">
            <span id="component-dialog" class="component-anchor-target">
              <VeyButton
                data-ui="qa-open-dialog"
                type="primary"
                @click="dialogVisible = true"
                >打开对话框 (Dialog)</VeyButton
              >
            </span>
            <span id="component-drawer" class="component-anchor-target">
              <VeyButton
                data-ui="qa-open-drawer"
                type="secondary"
                @click="drawerVisible = true"
                >打开右侧抽屉 (Drawer)</VeyButton
              >
            </span>
            <span id="component-modal" class="component-anchor-target">
              <VeyButton type="danger" @click="modalVisible = true"
                >打开模态框 (Modal)</VeyButton
              >
            </span>
          </div>

          <!-- Dialog demonstration -->
          <VeyDialog
            data-ui="qa-dialog"
            :visible="dialogVisible"
            title="安全审计详情"
            width="550px"
            @close="dialogVisible = false"
          >
            <div style="display: flex; flex-direction: column; gap: 12px">
              <p>
                这里是对话框的主体内容，支持溢出自动滚动。您可以在这里放置复杂的表单或详情数据：
              </p>
              <VeyDescriptions
                :items="[
                  { label: '审计对象', value: 'API Gateway /auth' },
                  { label: '威胁等级', value: 'CRITICAL' },
                  { label: '拦截策略', value: 'DROP CONNECTION' },
                ]"
                :column="1"
                border
              />
            </div>
            <template #footer>
              <VeyButton size="small" @click="dialogVisible = false"
                >关闭</VeyButton
              >
              <VeyButton
                type="primary"
                size="small"
                @click="
                  addToast('success', '审计确认', '审计数据已存档');
                  dialogVisible = false;
                "
              >
                确认并封禁
              </VeyButton>
            </template>
          </VeyDialog>

          <!-- Drawer demonstration -->
          <VeyDrawer
            data-ui="qa-drawer"
            v-model="drawerVisible"
            title="集群高级策略配置"
            width="450px"
            @close="drawerVisible = false"
          >
            <div style="display: flex; flex-direction: column; gap: 20px">
              <p>
                侧边抽屉通常用于复杂表单的配置，如网关策略、负载均衡参数等。
              </p>
              <VeyFormItem
                label="通信加密级别"
                hint="建议在生产环境启用 TLS 1.3"
              >
                <div
                  style="
                    border: 1px solid var(--vdl-border-default);
                    border-radius: var(--vdl-radius-md);
                    padding: 8px 12px;
                    font-size: 13px;
                    background-color: var(--vdl-bg-muted);
                    color: var(--vdl-text-muted);
                  "
                >
                  TLS 1.3 (默认)
                </div>
              </VeyFormItem>
              <VeyFormItem
                label="最大并发连接数"
                hint="超过此连接数将进行流量限速"
              >
                <VeyInput v-model="textVal" placeholder="例如 10000" />
              </VeyFormItem>
              <VeyFormItem label="启用 IP 白名单机制">
                <VeySwitch v-model="switchVal" />
              </VeyFormItem>
            </div>
            <template #footer>
              <VeyButton size="small" @click="drawerVisible = false"
                >取消</VeyButton
              >
              <VeyButton
                type="primary"
                size="small"
                @click="
                  addToast('success', '保存成功', '高级配置已生效');
                  drawerVisible = false;
                "
              >
                保存策略
              </VeyButton>
            </template>
          </VeyDrawer>

          <!-- Modal demonstration -->
          <VeyModal
            :visible="modalVisible"
            title="系统警告"
            message="您确定要彻底删除该容器及其绑定的数据卷吗？此操作属于敏感高危操作，可能会导致宿主机数据丢失，且无法撤销。"
            type="danger"
            confirm-text="强制删除"
            cancel-text="暂不删除"
            @confirm="
              addToast('error', '删除成功', '容器已强制销毁');
              modalVisible = false;
            "
            @cancel="modalVisible = false"
          />
        </section>

        <!-- Selection & Data Pagination (Select, Pagination) -->
        <section class="card">
          <h3>Selection & Pagination 下拉选择与分页</h3>

          <div
            class="row"
            style="
              flex-direction: column;
              align-items: flex-start;
              gap: 20px;
              width: 100%;
            "
          >
            <!-- Select demo -->
            <div
              id="component-select"
              class="component-anchor-target"
              style="width: 100%; max-width: 320px"
            >
              <VeyFormItem
                label="通信通道选择"
                hint="请选择当前要审计的网络通信通道"
              >
                <VeySelect
                  data-ui="qa-select"
                  v-model="selectVal"
                  :options="selectOptions"
                  @option-disabled="
                    (opt) =>
                      addToast('warning', '选项禁用', `${opt.label} 当前不可选`)
                  "
                />
              </VeyFormItem>
              <span style="font-size: 12px; color: var(--vdl-text-muted)">
                当前选中值:
                <VeyTag type="primary" size="small">{{ selectVal }}</VeyTag>
              </span>
            </div>

            <hr
              style="
                border: none;
                border-top: 1px solid var(--vdl-border-default);
                width: 100%;
                margin: 8px 0;
              "
            />

            <!-- Pagination demo -->
            <div
              id="component-pagination"
              class="component-anchor-target"
              style="
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 12px;
              "
            >
              <label
                style="
                  font-size: 13px;
                  color: var(--vdl-text-secondary);
                  font-weight: 500;
                "
                >数据分页导航</label
              >
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 20px;
                  flex-wrap: wrap;
                "
              >
                <VeyPagination
                  data-ui="qa-pagination"
                  :current-page="currentPageVal"
                  :total-pages="totalPagesVal"
                  @page-change="
                    (page) => {
                      currentPageVal = page;
                      addToast('info', '页面切换', `已导航至第 ${page} 页`);
                    }
                  "
                />
                <span style="font-size: 12px; color: var(--vdl-text-muted)">
                  当前页数:
                  <VeyTag type="success" size="small"
                    >{{ currentPageVal }} / {{ totalPagesVal }}</VeyTag
                  >
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Tables & DateTime Range Pickers -->
        <section class="card">
          <h3>Tables & DatePickers 表格与日期时间选择器</h3>

          <div
            class="row"
            style="
              flex-direction: column;
              align-items: flex-start;
              gap: 24px;
              width: 100%;
            "
          >
            <!-- Date picker demo -->
            <div
              id="component-date-time-range-picker"
              class="component-anchor-target"
              style="width: 100%; max-width: 450px"
            >
              <VeyFormItem
                label="统计时间范围 (DateTimeRangePicker)"
                hint="点击输入框选择自定义的时间窗口"
              >
                <VeyDateTimeRangePicker
                  data-ui="qa-date-time-range"
                  v-model="rangeVal"
                  placeholder="请选择时间范围"
                  start-label="起始时间"
                  end-label="结束时间"
                  shortcuts-label="快捷范围"
                  calendar-label="日历选择"
                  time-label="具体时间"
                  clear-label="清空"
                  confirm-label="确认"
                  cancel-label="取消"
                  locale="zh"
                  :week-days="weekDaysList"
                  :shortcuts="shortcutOptions"
                  @apply="
                    (val) =>
                      addToast('success', '时间范围已应用', `已选中范围。`)
                  "
                />
              </VeyFormItem>
            </div>

            <hr
              style="
                border: none;
                border-top: 1px solid var(--vdl-border-default);
                width: 100%;
                margin: 8px 0;
              "
            />

            <!-- Table demo -->
            <div
              id="component-table"
              class="component-anchor-target"
              style="width: 100%"
            >
              <label
                style="
                  font-size: 13px;
                  color: var(--vdl-text-secondary);
                  font-weight: 500;
                  display: block;
                  margin-bottom: 12px;
                "
              >
                自研数据表格 (VeyTable)
              </label>
              <VeyTable
                data-ui="qa-table"
                :data="tableData"
                :columns="tableColumns"
                border
              >
                <template #status="{ row }">
                  <VeyTag
                    :type="row.status === 'active' ? 'success' : 'warning'"
                  >
                    {{ row.status === "active" ? "正常运行" : "正在维护" }}
                  </VeyTag>
                </template>
                <template #actions="{ row }">
                  <VeyButton
                    type="primary"
                    size="small"
                    @click="
                      addToast('info', '节点操作', `正在连接到 ${row.name}`)
                    "
                  >
                    管理
                  </VeyButton>
                </template>
              </VeyTable>
            </div>

            <!-- Empty table demo -->
            <div style="width: 100%">
              <label
                style="
                  font-size: 13px;
                  color: var(--vdl-text-secondary);
                  font-weight: 500;
                  display: block;
                  margin-bottom: 12px;
                "
              >
                表格无数据占位状态 (VeyTable Empty)
              </label>
              <VeyTable
                :data="[]"
                :columns="tableColumns"
                border
                empty-text="当前网段内未发现可用的安全通信节点。"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style>
/* CSS overrides to style the playground wrapper */
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: var(--vdl-font-family);
  background-color: var(--vdl-bg-canvas);
  color: var(--vdl-text-primary);
  overflow: hidden !important;
}

.playground-wrapper {
  max-width: calc(1000px + 216px + 24px);
  height: calc(100% - 80px);
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.playground-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--vdl-bg-canvas);
  border-bottom: 1px solid var(--vdl-border-default);
  padding-bottom: 20px;
}

.playground-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.playground-header p {
  margin: 4px 0 0 0;
  color: var(--vdl-text-muted);
  font-size: 14px;
}

.playground-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.playground-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 216px minmax(0, 1fr);
  align-items: start;
  gap: 24px;
  overflow-y: auto;
}

.component-anchor-sidebar {
  position: sticky;
  top: 0;
  max-height: 100%;
  overflow-y: auto;
  padding-right: 12px;
  border-right: 1px solid var(--vdl-border-default);
}

.component-anchor-title {
  margin: 0 8px 10px;
  color: var(--vdl-text-primary);
  font-size: 13px;
  font-weight: 600;
}

.component-anchor-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.component-anchor-nav a {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 8px;
  border-radius: var(--vdl-radius-md);
  color: var(--vdl-text-secondary);
  font-size: 12px;
  text-decoration: none;
}

.component-anchor-nav a span:last-child {
  color: var(--vdl-text-muted);
}

.component-anchor-nav a:hover {
  background: var(--vdl-bg-muted);
  color: var(--vdl-text-primary);
}

.component-anchor-nav a.active {
  background: color-mix(in srgb, var(--vdl-primary) 12%, transparent);
  color: var(--vdl-primary);
  font-weight: 600;
}

.component-anchor-nav a.active span:last-child {
  color: var(--vdl-primary);
}

.component-anchor-target {
  scroll-margin-top: 20px;
}

.card {
  background-color: var(--vdl-bg-panel);
  border: 1px solid var(--vdl-border-default);
  border-radius: var(--vdl-radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  border-left: 3px solid var(--vdl-primary);
  padding-left: 10px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 13px;
  color: var(--vdl-text-secondary);
  font-weight: 500;
}

.form-item .hint {
  font-size: 12px;
  color: var(--vdl-text-muted);
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.icon-item {
  background-color: var(--vdl-bg-muted);
  border: 1px solid var(--vdl-border-default);
  border-radius: var(--vdl-radius-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--vdl-text-primary);
}

.icon-item span {
  font-size: 11px;
  color: var(--vdl-text-muted);
  text-align: center;
  word-break: break-all;
}

@media (max-width: 899px) {
  .playground-wrapper {
    max-width: 1000px;
  }

  .playground-layout {
    display: block;
  }

  .component-anchor-sidebar {
    display: none;
  }
}
</style>
