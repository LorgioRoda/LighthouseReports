import { applyChromeSettings, LighthouseConfig } from "../../../generate-config.ts";

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
  applyChromeSettings(config);
  return config;
}