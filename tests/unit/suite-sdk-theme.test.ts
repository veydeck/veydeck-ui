import { describe, expect, it } from "vitest";
import {
  applyThemeToTarget,
  normalizeTheme,
  resolveThemeState,
} from "../../packages/suite-sdk/src/theme";

describe("suite SDK appearance contract", () => {
  it("keeps legacy theme inputs glass-enabled", () => {
    expect(normalizeTheme("dark")).toEqual({
      theme: "dark",
      resolvedTheme: "dark",
      glassEnabled: true,
    });
    expect(
      resolveThemeState({ theme: "light", resolvedTheme: "light" }, "host"),
    ).toMatchObject({ glassEnabled: true, source: "host" });
  });

  it("applies the host material preference to the suite root", () => {
    const state = resolveThemeState(
      { theme: "dark", resolvedTheme: "dark", glassEnabled: false },
      "host",
    );
    applyThemeToTarget(document, state);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.glass).toBe("disabled");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });
});
