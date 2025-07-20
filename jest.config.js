import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      useESM: true,
      tsconfig: {
        module: "ES2020",
        target: "ES2020",
        moduleResolution: "node",
        isolatedModules: true,
        allowImportingTsExtensions: true
      }
    }]
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },

  transformIgnorePatterns: [
    "node_modules/(?!(.*\\.mjs$))"
  ],

  rootDir: ".",
  testMatch: ["<rootDir>/tests/**/*.test.ts"]
};