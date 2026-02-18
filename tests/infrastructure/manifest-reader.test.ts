import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { ManifestReader } from "../../src/core/reports/infrastructure/manifest-reader"

describe('manifest-reader', () => { 
    let tmpDir: string;
    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "lh-test-"));
      fs.mkdirSync(path.join(tmpDir, "mobile"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, "mobile", "manifest.json"),
        JSON.stringify([
          {
            url: ["http://test.com"],
            isRepresentativeRun: true,
            htmlPath: "test.html",
            jsonPath: "test.json",
            summary: { performance: 0.9, accessibility: 0.8, "best-practices": 0.7, seo: 0.6, pwa:
   0 },
          },
        ])
      );
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true });
    });

    it("should read mobile manifest from custom basePath", () => {
      const reader = new ManifestReader({ basePath: tmpDir });
      const sources = reader.readAllManifests();

      expect(sources.length).toBe(1);
      expect(sources[0].type).toBe("mobile");
      expect(sources[0].runs[0].summary.performance).toBe(0.9);
    });
    it("should throw error when no manifest are found", () => {
        const reader = new ManifestReader({ basePath: '' });
        expect(() => reader.readAllManifests()).toThrow("❌ No manifest files found")
    })
})