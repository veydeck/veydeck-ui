import type { InjectionKey, ComputedRef } from "vue";
import { glassTokens } from "@veydeck/tokens/glass";
import { glassNumber } from "./internal/glass-tokens";

/** Normalized material controls. Values outside 0–1 are clamped. */
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

export const glassContext: InjectionKey<{
  value: ComputedRef<VeyGlassValue | undefined>;
  theme: ComputedRef<string | undefined>;
  tokens: ComputedRef<Record<string, string>>;
  scope: ComputedRef<HTMLElement | undefined>;
}> = Symbol("veydeck-glass");

function normalized(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : fallback;
}

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
