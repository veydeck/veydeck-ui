import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const packageRoot = resolve(import.meta.dirname, "../packages/tokens");
const outputDirectory = resolve(packageRoot, "dist");

// CSS is the sole source of material defaults; renderers use the generated
// framework-independent JS export only when an inherited CSS value is absent.
const glassCss = await readFile(resolve(packageRoot, "src/glass.css"), "utf8");
const defaults = glassCss.match(/:root\s*\{([^}]+)\}/)?.[1];
if (!defaults) throw new Error("Missing default glass token scope");
const glassTokens = Object.fromEntries(
  [...defaults.matchAll(/(--vdl-glass-[\w-]+)\s*:\s*([^;{}]+);/g)].map(
    ([, name, value]) => [name, value.trim()],
  ),
);
if (Object.keys(glassTokens).length === 0)
  throw new Error("Missing glass tokens");
await mkdir(outputDirectory, { recursive: true });
await copyFile(
  resolve(packageRoot, "src/index.css"),
  resolve(outputDirectory, "index.css"),
);
await copyFile(
  resolve(packageRoot, "src/glass.css"),
  resolve(outputDirectory, "glass.css"),
);
await copyFile(
  resolve(packageRoot, "src/scrollbar.css"),
  resolve(outputDirectory, "scrollbar.css"),
);
await writeFile(
  resolve(outputDirectory, "glass.js"),
  `// Generated from src/glass.css. Do not edit.\nexport const glassTokens = Object.freeze(${JSON.stringify(glassTokens, null, 2)});\n`,
);
await writeFile(
  resolve(outputDirectory, "glass.d.ts"),
  "/** Generated defaults from glass.css; CSS overrides are resolved by consumers. */\nexport declare const glassTokens: Readonly<Record<string, string>>;\n",
);

console.log("已构建 @veydeck/tokens");
