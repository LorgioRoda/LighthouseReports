import { ManifestRepository } from "../domain/manifest-repository";


type ManifestType = "main" | "mobile" | "desktop";

type ReportPath = "./.lighthouse-reports/manifest.json" | `./.lighthouse-reports/${ManifestType}/manifest.json`;

interface ManifestSource {
    type: ManifestType;
    path: ReportPath;
    runs: ManifestRun[];
  }

  interface ManifestRun {
    url: string | string[];
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
    constructor(private manifestRepository: ManifestRepository) {
    }
    public findAllRepresentativeRuns(): Array<{ run: ManifestRun; type: string }> {
        const manifests = this.manifestRepository.readAllManifests()
        
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
          throw new Error("❌ No representative runs found in any manifest");
        }
    
        return representativeRuns;
      }    

}