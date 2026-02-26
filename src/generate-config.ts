import * as fs from "fs";
import { buildMobileConfig } from "./core/reports/application/build-mobile-config";
import { buildDesktopConfig } from "./core/reports/application/build-desktop-config";

export interface LighthouseConfig {
  ci: {
    collect: {
      url: string[];
      numberOfRuns: number;
      settings: Record<string, unknown>;
      chromePath?: string;
    };
    upload: {
      target: string;
      outputDir: string;
    };
  };
}

export function parseUrls(input: string): string[] {
  return input
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
}

const CI_CHROME_FLAGS = ["--no-sandbox", "--disable-dev-shm-usage"];

export function applyChromeSettings(config: LighthouseConfig): void {
  config.ci.collect.settings.chromeFlags = CI_CHROME_FLAGS;
  if (process.env.CHROME_PATH) {
    config.ci.collect.chromePath = process.env.CHROME_PATH;
  }
}

function writeConfig(path: string, config: LighthouseConfig): void {
  fs.writeFileSync(path, JSON.stringify(config, null, 2));
  console.log(`Generated ${path}`);
}

function main(): void {
  const urls = process.argv[2];
  const device = process.argv[3] || "all";
  const numberOfRuns = parseInt(process.argv[4] || "3", 10);

  if (!urls) {
    throw new Error("Usage: generate-config.ts <urls> [device] [numberOfRuns]");
  }

  const parsedUrls = parseUrls(urls);

  if (device === "mobile" || device === "all") {
    writeConfig(".lighthouserc.mobile.json", buildMobileConfig(parsedUrls, numberOfRuns));
  }

  if (device === "desktop" || device === "all") {
    writeConfig(".lighthouserc.desktop.json", buildDesktopConfig(parsedUrls, numberOfRuns));
  }
}

const isDirectRun = process.argv[1]?.includes("generate-config");
if (isDirectRun) {
  main();
}
