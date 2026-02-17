import { HandleManifest } from "./core/reports/application/handle-manifest.ts";
import { ManifestReader } from "./core/reports/infrastructure/manifest-reader.ts";
import { Report } from "./core/reports/domain/report.ts";
import { DependencyContainer } from "./core/reports/dependency-container.ts";
import { FileReaderSystem } from "./core/reports/infrastructure/file-reader-system.ts";
import { FileReader } from "./core/reports/domain/file-reader.ts";
import { CreateReport } from "./core/reports/application/create-report.ts";

export class LighthouseGistUploader {
  constructor(
    private handleManifest: HandleManifest, 
    private fileReader: FileReader,
    private createReport: CreateReport
  ){}

  async uploadAll(): Promise<Report[]> {
    const representativeRuns = this.handleManifest.findAllRepresentativeRuns();
    const results: Report[] = [];

    console.log(
      `\n🚀 Uploading ${
        representativeRuns.length
      } representative runs...`
    );

    for (const { run, type } of representativeRuns) {
      console.log(`\n📤 Processing ${type} report...`);

      try {
        const content = this.fileReader.read(run.jsonPath)
        const filename =
          run.jsonPath.split("/").pop() || `lighthouse-${type}.json`;

        const result = await this.createReport.execute(filename,
          content,
          type,
          run.summary.performance,)
          
        results.push(result);

        console.log(`✅ ${type.toUpperCase()} gist created: ${result.id}`);
        console.log(`🔗 Viewer: ${result.viewerUrl}`);

      } catch (err) {
        console.error(`❌ Failed to upload ${type} report:`, err);
      }
    }

    return results;
  }

  /** Display summary of all created gists */
  displaySummary(results: Report[], dryRun: boolean = false): void {

    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.type.toUpperCase()}`);
      console.log(`   📈 Performance: ${Math.round(result.performance)}%`);
      console.log(`   🆔 Gist ID: ${result.id}`);
      console.log(`   🔗 Viewer: ${result.viewerUrl}`);
      console.log("");
    });

    const avgPerformance =
      results.reduce((sum, r) => sum + r.performance, 0) / results.length;
    console.log(`📊 Average Performance: ${Math.round(avgPerformance)}%`);
  }
}

async function main(): Promise<void> {
  console.log("🚀 Lighthouse Gist Uploader - Multiple Reports Mode");
  console.log("━".repeat(50));

  const container = DependencyContainer.getInstance();
  const uploader = new LighthouseGistUploader(
    new HandleManifest(new ManifestReader()),
    new FileReaderSystem(), container.createReportUseCase()
  );

  try {
    const results = await uploader.uploadAll();
    uploader.displaySummary(results);
  }
  catch {
    console.error("Error");
  }
}

const isDirectRun = (() => {
  if (typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID)) {
    return false;
  }
  return process.argv.length > 1 && process.argv.some(arg => arg.includes('upload-gist'));
})();

if (isDirectRun) {
  main().catch((err) => {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  });
}
