import * as fs from "fs";
import { ManifestSource, ManifestRun } from "../domain/manifest";
import { ManifestRepository } from "../domain/manifest-repository";

export class ManifestReader implements ManifestRepository {
  constructor(private basePath: string = "./.lighthouse-reports"){}
    public readAllManifests(): ManifestSource[] {
            const sources: ManifestSource[] = [];
        
            try {
              sources.push({
                type: "main",
                path: `${this.basePath}/manifest.json`,
                runs: this.getMainManifest(),
              });
              console.log("📋 Main manifest loaded");
            } catch {
              console.log("⚠️  Main manifest not found");
            }
              
            try {
              sources.push({
                type: "mobile",
                path: `${this.basePath}/mobile/manifest.json`,
                runs: this.getMobileManifest(),
              });
              console.log("📱 Mobile manifest loaded");
            } catch {
              console.log("⚠️  Mobile manifest not found");
            }
        
            try {
              sources.push({
                type: "desktop",
                path: `${this.basePath}/desktop/manifest.json`,
                runs: this.getDesktopManifest(),
              });
              console.log("🖥️  Desktop manifest loaded");
            } catch {
              console.log("⚠️  Desktop manifest not found");
            }
        
            if (sources.length === 0) {
              console.error("❌ No manifest files found");
              throw new Error("❌ No manifest files found");
              
            }
        
            return sources;
          }
    private getDesktopManifest(): ManifestRun[] {
        const desktopContent = fs.readFileSync(
            `${this.basePath}/desktop/manifest.json`,
            "utf-8"
            );
            return JSON.parse(desktopContent);
    }
    private getMobileManifest(): ManifestRun[] {
        const mobileContent = fs.readFileSync(
            `${this.basePath}/mobile/manifest.json`,
            "utf-8"
            );
            return JSON.parse(mobileContent);
    }

    private getMainManifest(): ManifestRun[] {
        const mainContent = fs.readFileSync(
            `${this.basePath}/manifest.json`,
            "utf-8"
            );
            return JSON.parse(mainContent);
    }
}
