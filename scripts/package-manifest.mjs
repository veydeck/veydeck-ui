import { resolve } from "node:path";

export const repositoryRoot = resolve(import.meta.dirname, "..");
export const packageDirectories = [
  "packages/tokens",
  "packages/icons",
  "packages/suite-sdk",
  "packages/vue",
  "packages/react",
];
export const packageNames = [
  "@veydeck/tokens",
  "@veydeck/icons",
  "@veydeck/suite-sdk",
  "@veydeck/vue",
  "@veydeck/react",
];
