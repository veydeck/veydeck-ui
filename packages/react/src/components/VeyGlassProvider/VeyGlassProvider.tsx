import React, { useContext, useLayoutEffect, useMemo, useState } from "react";
import { glassContext, type VeyGlassValue } from "../../glass";
import { observeGlassTokens } from "../../internal/glass-tokens";

export interface VeyGlassProviderProps {
  /** 子树材质配置；省略时继承上层 Provider。 */
  glass?: VeyGlassValue;
  children?: React.ReactNode;
}

/** 为普通子树与 Portal 浮层统一提供材质、主题和公共 Token。 */
export const VeyGlassProvider: React.FC<VeyGlassProviderProps> = ({
  glass,
  children,
}) => {
  const parent = useContext(glassContext);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<string>();
  const [tokens, setTokens] = useState<Record<string, string>>({});

  useLayoutEffect(() => {
    if (!root) return;
    const read = () => {
      setTheme(
        root.closest("[data-theme]")?.getAttribute("data-theme") ?? undefined,
      );
      const style = getComputedStyle(root);
      const next: Record<string, string> = {};
      for (let index = 0; index < style.length; index += 1) {
        const property = style.item(index);
        if (property.startsWith("--vdl-"))
          next[property] = style.getPropertyValue(property);
      }
      setTokens((current) =>
        JSON.stringify(current) === JSON.stringify(next) ? current : next,
      );
    };
    read();
    return observeGlassTokens(root, read);
  }, [root]);

  const context = useMemo(
    () => ({
      value: glass ?? parent?.value,
      theme: theme ?? parent?.theme,
      tokens,
      scope: root ?? undefined,
    }),
    [glass, parent?.value, parent?.theme, root, theme, tokens],
  );

  return (
    <glassContext.Provider value={context}>
      <div
        ref={setRoot}
        style={{ display: "contents" }}
        data-ui="glass-provider"
      >
        {children}
      </div>
    </glassContext.Provider>
  );
};
