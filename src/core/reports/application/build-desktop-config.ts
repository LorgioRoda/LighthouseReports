import { LighthouseConfig, applyChromeSettings } from "../../../generate-config.ts";

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
  applyChromeSettings(config);
  return config;
}