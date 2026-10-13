import { createContext } from "react";
import { glassTokens } from "@veydeck/tokens/glass";
import { glassNumber } from "./internal/glass-tokens";

/** Liquid Glass 的可选光学控制，所有数值都会限制在 0–1。 */
export interface VeyGlassOptions {
  intensity?: number;
  refraction?: number;
  blur?: number;
  opacity?: number;
  highlight?: number;
}

export type VeyGlassValue = boolean | VeyGlassOptions;
export type VeyGlassProfile = "control" | "surface" | "input";
export type VeyGlassMode = "refraction" | "blur" | "solid";

export interface ResolvedGlass {
  enabled: boolean;
  refraction: number;
  blur: number;
  opacity: number;
  highlight: number;
}

export interface GlassContextValue {
  value?: VeyGlassValue;
  theme?: string;
  tokens: Record<string, string>;
  scope?: HTMLElement;
}

export const glassContext = createContext<GlassContextValue | undefined>(
  undefined,
);

function normalized(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : fallback;
}

/** 使用当前 profile 的公共 Token 解析最终材质参数。 */
export function resolveGlass(
  value: VeyGlassValue | undefined,
  profile: VeyGlassProfile = "control",
  tokens: Readonly<Record<string, string>> = glassTokens,
): ResolvedGlass {
  const options = typeof value === "object" && value ? value : {};
  const intensity = normalized(options.intensity, 1);
  const defaults = {
    refraction: glassNumber(tokens, `${profile}-refraction`),
    blur: glassNumber(tokens, `${profile}-blur`),
    opacity: glassNumber(tokens, `${profile}-opacity`),
    highlight: glassNumber(tokens, `${profile}-highlight`),
  };
  return {
    enabled: value !== false,
    refraction: normalized(options.refraction, defaults.refraction * intensity),
    blur: normalized(options.blur, defaults.blur * intensity),
    opacity: normalized(
      options.opacity,
      1 - (1 - defaults.opacity) * intensity,
    ),
    highlight: normalized(options.highlight, defaults.highlight * intensity),
  };
}
