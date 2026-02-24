import { FileReader } from "../domain/file-reader";
import { CreateReport } from "./create-report";
import { HandleManifest } from "./handle-manifest";
import { Report } from "../domain/report";

export class CreateReportsFromManifest {
  constructor(
    private handleManifest: HandleManifest,
    private fileReader: FileReader,
    private createReport: CreateReport,
  ) {}

  async execute(): Promise<Report[]> {
    const representativeRuns = this.handleManifest.findAllRepresentativeRuns();
    const reports: Report[] = [];

    console.log(`\n🚀 Uploading ${representativeRuns.length} representative runs...`);

    for (const { run, type } of representativeRuns) {
      const testUrl = Array.isArray(run.url) ? run.url[0] : run.url;
      console.log(`\n📤 Processing ${type} report for ${testUrl}...`);
      try {
        const content = this.fileReader.read(run.jsonPath);
        const filename = run.jsonPath.split("/").pop() || `lighthouse-${type}.json`;
        const report = await this.createReport.execute(filename, content, type, testUrl, run.summary.performance);
        reports.push(report);
        console.log(`✅ ${type.toUpperCase()} gist created: ${report.id}`);
        console.log(`🔗 Viewer: ${report.viewerUrl}`);
      } catch (err) {
        console.error(`❌ Failed to upload ${type} report:`, err);
      }
    }

    return reports;
  }
}
