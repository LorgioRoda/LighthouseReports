import { Report } from "../domain/report.ts";
import { CreateReportGits } from "../../../infrastructure/create-report-gits.ts";

export class CreateReport {
    constructor(private readonly createReportGits: CreateReportGits) {
      this.createReportGits = createReportGits;
    }

    public async execute(
        filename: string,
        content: string,
        type: string,
        performance: number,
      ): Promise<Report> {
        try {
          const description = this.getDescription(type, performance);
    
          const report = await this.createReportGits.execute({
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
          console.error(`❌ Error creating report for ${type}:`, err);
          throw err;
        }
      }
    
    private getDescription(type: string, performance: number): string {
        return `Lighthouse Report - ${type.toUpperCase()} (${Math.round(
            performance * 100
          )}% performance)`;
    }
}