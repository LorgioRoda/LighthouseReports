import * as fs from "fs";


type ManifestType = "main" | "mobile" | "desktop";

type ReportPath = "./.lighthouse-reports/manifest.json" | `./.lighthouse-reports/${ManifestType}/manifest.json`;

interface ManifestSource {
    type: ManifestType;
    path: ReportPath;
    runs: ManifestRun[];
  }

  interface ManifestRun {
    url: string;
    isRepresentativeRun: boolean;
    htmlPath: string;
    jsonPath: string;
    summary: {
      performance: number;
      accessibility: number;
      "best-practices": number;
      seo: number;
      pwa: number;
    };
  }

export class HandleManifest {
    constructor() {
    }
    public findAllRepresentativeRuns(): Array<{ run: ManifestRun; type: string }> {
        const manifests = this.readAllManifests();
        
        const representativeRuns: Array<{ run: ManifestRun; type: string }> = [];
    
        for (const manifest of manifests) {
          const representativeRun = manifest.runs.find(
            (run) => run.isRepresentativeRun
          );
    
          if (representativeRun) {
            representativeRuns.push({
              run: representativeRun,
              type: manifest.type,
            });
            console.log(
              `✅ Found representative run for ${manifest.type}: Performance ${Math.round(
                representativeRun.summary.performance * 100
              )}%`
            );
          } else {
            console.log(
              `⚠️  No representative run found in ${manifest.type} manifest`
            );
          }
        }
    
        if (representativeRuns.length === 0) {
          console.error("❌ No representative runs found in any manifest");
          process.exit(1);
        }
    
        return representativeRuns;
      }    


    private readAllManifests(): ManifestSource[] {
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