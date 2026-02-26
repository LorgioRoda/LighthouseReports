import { buildDesktopConfig } from "../src/core/reports/application/build-desktop-config";
import { buildMobileConfig } from "../src/core/reports/application/build-mobile-config";
import { parseUrls } from "../src/generate-config";

describe("parseUrls", () => {
  it("should split comma-separated URLs and trim whitespace", () => {
    const result = parseUrls("https://example.com , https://example.com/about ");
    expect(result).toEqual(["https://example.com", "https://example.com/about"]);
  });

  it("should handle a single URL without comma", () => {
    const result = parseUrls("https://example.com");
    expect(result).toEqual(["https://example.com"]);
  });

  it("should filter out empty strings from trailing commas", () => {
    const result = parseUrls("https://example.com, , https://example.com/about,");
    expect(result).toEqual(["https://example.com", "https://example.com/about"]);
  });
});

describe("buildMobileConfig", () => {
  it("should generate a mobile config with correct structure", () => {
    const config = buildMobileConfig(["https://example.com"], 3);
    expect(config.ci.collect.url).toEqual(["https://example.com"]);
    expect(config.ci.collect.numberOfRuns).toBe(3);
    expect(config.ci.collect.settings.formFactor).toBe("mobile");
    expect(config.ci.upload.target).toBe("filesystem");
    expect(config.ci.upload.outputDir).toBe("./.lighthouse-reports/mobile");
  });

  it("should not include screenEmulation or throttling", () => {
    const config = buildMobileConfig(["https://example.com"], 1);
    expect(config.ci.collect.settings).not.toHaveProperty("screenEmulation");
    expect(config.ci.collect.settings).not.toHaveProperty("throttling");
  });
});

describe("buildDesktopConfig", () => {
  it("should generate a desktop config with screenEmulation and throttling", () => {
    const config = buildDesktopConfig(["https://example.com"], 5);
    expect(config.ci.collect.url).toEqual(["https://example.com"]);
    expect(config.ci.collect.numberOfRuns).toBe(5);
    expect(config.ci.collect.settings.formFactor).toBe("desktop");
    expect(config.ci.collect.settings).toHaveProperty("screenEmulation");
    expect(config.ci.collect.settings).toHaveProperty("throttling");
    expect(config.ci.upload.outputDir).toBe("./.lighthouse-reports/desktop");
  });

  it("should have correct screenEmulation values", () => {
    const config = buildDesktopConfig(["https://example.com"], 1);
    const screen = config.ci.collect.settings.screenEmulation as Record<string, unknown>;
    expect(screen.mobile).toBe(false);
    expect(screen.width).toBe(1024);
    expect(screen.height).toBe(850);
  });
});
