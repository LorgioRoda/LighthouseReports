import * as fs from "fs";

export interface LighthouseConfig {
  ci: {
    collect: {
      url: string[];
      numberOfRuns: number;
      settings: Record<string, unknown>;
      chromePath?: string;
      chromeFlags?: string[];
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

function applyChromePath(config: LighthouseConfig): void {
  if (process.env.CHROME_PATH) {
    config.ci.collect.chromePath = process.env.CHROME_PATH;
    config.ci.collect.chromeFlags = ["--no-sandbox"];
  }
}

export function buildMobileConfig(
  urls: string[],
  numberOfRuns: number,
): LighthouseConfig {
  const config: LighthouseConfig = {
    ci: {
      collect: {
        url: urls,
        numberOfRuns,
        settings: {
          formFactor: "mobile",
        },
      },
      upload: {
        target: "filesystem",
        outputDir: "./.lighthouse-reports/mobile",
      },
    },
  };
  applyChromePath(config);
  return config;
}

export function buildDesktopConfig(
  urls: string[],
  numberOfRuns: number,
): LighthouseConfig {
  const config: LighthouseConfig = {
    ci: {
      collect: {
        url: urls,
        numberOfRuns,
        settings: {
          formFactor: "desktop",
          screenEmulation: {
            mobile: false,
            width: 1024,
            height: 850,
            deviceScaleFactor: 1,
            disabled: false,
          },
          throttling: {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          },
        },
      },
      upload: {
        target: "filesystem",
        outputDir: "./.lighthouse-reports/desktop",
      },
    },
  };
  applyChromePath(config);
  return config;
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
