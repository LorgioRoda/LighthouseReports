import { Report } from "../domain/report.ts";
import { ReportRepository } from "../domain/report-repository.ts";

export class CreateReport {
    constructor(
        private readonly reportRepository: ReportRepository,
    ) {}

    public async execute(
        filename: string,
        content: string,
        type: string,
        testUrl: string,
        performance: number,
      ): Promise<Report> {
        try {
          const description = this.getDescription(type, testUrl, performance);

          const report = await this.reportRepository.createReport({
            filename,
            content,
            description,
            type,
            testUrl,
            performance,
          });

          return {
            type,
            testUrl,
            id: report.id,
            viewerUrl: report.viewerUrl,
            filename: report.filename,
            performance: report.performance,
          };
        } catch (err) {
          console.error(`❌ Error creating report for ${type}:`, err);
          throw err;
        }
      }

    private getDescription(type: string, testUrl: string, performance: number): string {
        return `Lighthouse Report - ${type.toUpperCase()} - ${testUrl} (${Math.round(
            performance * 100
          )}% performance)`;
    }
}
