import * as fs from "fs";
import { ManifestSource, ManifestRun } from "../domain/manifest";
import { ManifestRepository } from "../domain/manifest-repository";

export class ManifestReader implements ManifestRepository {
    public readAllManifests(): ManifestSource[] {
            const sources: ManifestSource[] = [];
        
            try {
              sources.push({
                type: "main",
                path: "./.lighthouse-reports/manifest.json",
                runs: this.getMainManifest(),
              });
              console.log("📋 Main manifest loaded");
            } catch {
              console.log("⚠️  Main manifest not found");
            }
              
            try {
              sources.push({
                type: "mobile",
                path: "./.lighthouse-reports/mobile/manifest.json",
                runs: this.getMobileManifest(),
              });
              console.log("📱 Mobile manifest loaded");
            } catch {
              console.log("⚠️  Mobile manifest not found");
            }
        
            try {
              sources.push({
                type: "desktop",
                path: "./.lighthouse-reports/desktop/manifest.json",
                runs: this.getDesktopManifest(),
              });
              console.log("🖥️  Desktop manifest loaded");
            } catch {
              console.log("⚠️  Desktop manifest not found");
            }
        
            if (sources.length === 0) {
              console.error("❌ No manifest files found");
              process.exit(1);
            }
        
            return sources;
          }
    private getDesktopManifest(): ManifestRun[] {
        const desktopContent = fs.readFileSync(
            "./.lighthouse-reports/desktop/manifest.json",
            "utf-8"
            );
            return JSON.parse(desktopContent);
    }
    private getMobileManifest(): ManifestRun[] {
        const mobileContent = fs.readFileSync(
            "./.lighthouse-reports/mobile/manifest.json",
            "utf-8"
            );
            return JSON.parse(mobileContent);
    }

    private getMainManifest(): ManifestRun[] {
        const mainContent = fs.readFileSync(
            "./.lighthouse-reports/manifest.json",
            "utf-8"
            );
            return JSON.parse(mainContent);
    }
}
