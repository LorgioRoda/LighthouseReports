import { Report } from "../domain/report.ts";
import { ReportRepository } from "../domain/report-repository.ts";
import { Logger } from "../domain/logger.ts";

export class CreateReport {
    constructor(
        private readonly reportRepository: ReportRepository,
        private readonly logger: Logger,
    ) {}

    public async execute(
        filename: string,
        content: string,
        type: string,
        performance: number,
      ): Promise<Report> {
        try {
          const description = this.getDescription(type, performance);

          const report = await this.reportRepository.createReport({
            filename,
            content,
            description,
            type,
            performance,
          });

          return {
            type,
            id: report.id,
            viewerUrl: report.viewerUrl,
            filename: report.filename,
            performance: report.performance,
          };
        } catch (err) {
          this.logger.error(`❌ Error creating report for ${type}:`, err);
          throw err;
        }
      }

    private getDescription(type: string, performance: number): string {
        return `Lighthouse Report - ${type.toUpperCase()} (${Math.round(
            performance * 100
          )}% performance)`;
    }
}
