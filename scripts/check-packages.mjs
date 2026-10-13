import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import {
  packageDirectories,
  packageNames,
  repositoryRoot,
} from "./package-manifest.mjs";

const execFileAsync = promisify(execFile);
const outputDirectory = await mkdtemp(resolve(tmpdir(), "veydeck-ui-pack-"));
const selectedPackage = process.argv[2];
const selectedIndex = selectedPackage
  ? packageNames.indexOf(selectedPackage)
  : -1;
if (selectedPackage && selectedIndex === -1) {
  throw new Error(`未知发布包：${selectedPackage}`);
}
const directories = selectedPackage
  ? [packageDirectories[selectedIndex]]
  : packageDirectories;

try {
  for (const directory of directories) {
    const cwd = resolve(repositoryRoot, directory);
    const { stdout } = await execFileAsync(
      "npm",
      ["pack", "--json", "--pack-destination", outputDirectory],
      { cwd },
    );
    const [result] = JSON.parse(stdout);
    const files = result.files.map((file) => file.path);
    const unexpected = files.filter(
      (file) =>
        file !== "package.json" &&
        file !== "README.md" &&
        file !== "CHANGELOG.md" &&
        !file.startsWith("dist/"),
    );
    if (unexpected.length) {
      throw new Error(
        `${result.name} 包含非发布文件：${unexpected.join(", ")}`,
      );
    }
    if (!files.some((file) => file.startsWith("dist/"))) {
      throw new Error(`${result.name} 缺少 dist 构建产物`);
    }
    console.log(
      `${result.name}@${result.version} 归档检查通过，共 ${files.length} 个文件`,
    );
  }
} finally {
  await rm(outputDirectory, { recursive: true, force: true });
}
