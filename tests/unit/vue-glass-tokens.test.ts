import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { glassTokens } from "../../packages/tokens/dist/glass.js";
import { glassNumber } from "../../packages/vue/src/internal/glass-tokens";
import { resolveGlass } from "../../packages/vue/src/glass";

describe("shared material tokens consumed by Vue", () => {
  it("ships the same default declarations to CSS and JS consumers", () => {
    const css = readFileSync(resolve("packages/tokens/dist/glass.css"), "utf8");
    const source = readFileSync(
      resolve("packages/tokens/src/glass.css"),
      "utf8",
    );
    expect(css).toBe(source);
    const defaults = css.match(/:root\s*\{([^}]+)\}/)![1];
    const declarations = Object.fromEntries(
      [...defaults.matchAll(/(--vdl-glass-[\w-]+)\s*:\s*([^;]+);/g)].map(
        ([, key, value]) => [key, value.trim()],
      ),
    );
    expect(glassTokens).toEqual(declarations);
    expect(glassTokens["--vdl-glass-surface-tint"]).toBe("var(--vdl-bg-base)");
    expect(glassTokens["--vdl-glass-border-hover"]).toBe(
      "var(--vdl-border-brand)",
    );
  });

  it("ships a framework-independent solid fallback", () => {
    const css = readFileSync(resolve("packages/tokens/src/glass.css"), "utf8");
    const disabled = css.match(/\[data-glass="disabled"\]\s*\{([^}]+)\}/)?.[1];
    expect(disabled).toBeTruthy();
    for (const profile of ["control", "surface", "input"]) {
      expect(disabled).toContain(`--vdl-glass-${profile}-refraction: 0;`);
      expect(disabled).toContain(`--vdl-glass-${profile}-blur: 0;`);
      expect(disabled).toContain(`--vdl-glass-${profile}-opacity: 1;`);
      expect(disabled).toContain(`--vdl-glass-${profile}-highlight: 0;`);
    }
  });

  it("ships one scrollbar material recipe for every framework and suite", () => {
    const source = readFileSync(
      resolve("packages/tokens/src/scrollbar.css"),
      "utf8",
    );
    const built = readFileSync(
      resolve("packages/tokens/dist/scrollbar.css"),
      "utf8",
    );
    const index = readFileSync(
      resolve("packages/tokens/src/index.css"),
      "utf8",
    );

    expect(built).toBe(source);
    expect(index).toContain('@import "./scrollbar.css";');
    expect(source).toContain("--vdl-scrollbar-thumb-hover:");
    expect(source).toContain("--vdl-scrollbar-thumb-active:");
    expect(source).toContain("*::-webkit-scrollbar-thumb:hover");
    expect(source).toContain("@media (forced-colors: active)");

    const disabled = source.match(
      /\[data-glass="disabled"\]\s*\{([^}]+)\}/,
    )?.[1];
    expect(disabled).toContain("--vdl-scrollbar-highlight: transparent;");
    expect(disabled).toContain("--vdl-scrollbar-inner-edge: transparent;");
  });

  it("resolves inherited profile defaults before explicit component controls", () => {
    const tokens = {
      ...glassTokens,
      "--vdl-glass-control-opacity": "0.3",
      "--vdl-glass-control-refraction": "0.8",
    };
    expect(resolveGlass(undefined, "control", tokens).opacity).toBeCloseTo(0.3);
    expect(resolveGlass(undefined, "control", tokens).refraction).toBe(0.8);
    expect(resolveGlass({ intensity: 0.5 }, "control", tokens)).toMatchObject({
      opacity: 0.65,
      refraction: 0.4,
    });
    expect(
      resolveGlass({ opacity: 0.9, refraction: 0 }, "control", tokens),
    ).toMatchObject({ opacity: 0.9, refraction: 0 });
  });

  it("uses generated defaults for invalid units and bounds physical effects", () => {
    expect(
      glassNumber({ "--vdl-glass-blur-max": "2rem" }, "blur-max", "px", 80),
    ).toBe(parseFloat(glassTokens["--vdl-glass-blur-max"]));
    expect(
      glassNumber(
        { "--vdl-glass-refraction-max": "NaN" },
        "refraction-max",
        "px",
        100,
      ),
    ).toBe(parseFloat(glassTokens["--vdl-glass-refraction-max"]));
    expect(
      glassNumber({ "--vdl-glass-blur-max": "1000px" }, "blur-max", "px", 80),
    ).toBe(80);
    expect(
      glassNumber({ "--vdl-glass-control-opacity": "0" }, "control-opacity"),
    ).toBe(0);
  });
});
