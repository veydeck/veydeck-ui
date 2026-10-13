export type IconNamespace = "common" | "apps";

const icons = import.meta.glob("./svgs/{apps,common}/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const iconMap: Record<IconNamespace, Record<string, string>> = {
  common: {},
  apps: {},
};

for (const [path, content] of Object.entries(icons)) {
  const namespace: IconNamespace = path.includes("/apps/") ? "apps" : "common";
  const filename = path.split("/").pop()?.replace(".svg", "");
  if (filename) {
    iconMap[namespace][filename.toLowerCase()] = content;
  }
}

export function getIcon(
  name: string,
  namespace: IconNamespace = "common",
): string {
  const cleanName = (name || "").trim().toLowerCase();
  return iconMap[namespace][cleanName] || iconMap.common.fallback || "";
}

export { iconMap };
