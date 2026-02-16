export type ManifestType = "main" | "mobile" | "desktop";

export type ReportPath = "./.lighthouse-reports/manifest.json" | `./.lighthouse-reports/${ManifestType}/manifest.json`;

export interface ManifestSource {
    type: ManifestType;
    path: ReportPath;
    runs: ManifestRun[];
}

export interface ManifestRun {
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