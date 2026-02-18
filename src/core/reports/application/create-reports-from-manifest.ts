import { FileReader } from "../domain/file-reader";
import { Logger } from "../domain/logger";
import { CreateReport } from "./create-report";
import { HandleManifest } from "./handle-manifest";
import { Report } from "../domain/report";

export class CreateReportsFromManifest {
  constructor(
    private handleManifest: HandleManifest,
    private fileReader: FileReader,
    private createReport: CreateReport,
    private logger: Logger,
  ) {}

  async execute(): Promise<Report[]> {
    const representativeRuns = this.handleManifest.findAllRepresentativeRuns();
    const reports: Report[] = [];

    this.logger.info(`\n🚀 Uploading ${representativeRuns.length} representative runs...`);

    for (const { run, type } of representativeRuns) {
      this.logger.info(`\n📤 Processing ${type} report...`);
      try {
        const content = this.fileReader.read(run.jsonPath);
        const filename = run.jsonPath.split("/").pop() || `lighthouse-${type}.json`;
        const report = await this.createReport.execute(filename, content, type, run.summary.performance);
        reports.push(report);
        this.logger.info(`✅ ${type.toUpperCase()} gist created: ${report.id}`);
        this.logger.info(`🔗 Viewer: ${report.viewerUrl}`);
      } catch (err) {
        this.logger.error(`❌ Failed to upload ${type} report:`, err);
      }
    }

    return reports;
  }
}
