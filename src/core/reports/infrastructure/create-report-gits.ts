import { Octokit } from "@octokit/rest";
import { Report } from "../domain/report.ts";
import { createReportAdapter } from "./adapter/create-report-adapter.ts";
import { ReportRepository } from "../domain/report-repository.ts";

export class CreateReportGits implements ReportRepository {
    constructor(private readonly octokit: Octokit) {
        this.octokit = octokit;
    }

    public async createReport(params: {
        filename: string;
        content: string;
        description: string;
        type: string;
        testUrl: string;
        performance: number;
    }): Promise<Report> {
        const response = await this.octokit.gists.create({
            files: { [params.filename]: { content: params.content } },
            public: false,
            description: params.description,
          });
          const res = createReportAdapter(response.data);
    
          return {
            type: params.type,
            testUrl: params.testUrl,
            id: res.id,
            viewerUrl: res.viewerUrl,
            filename: res.filename,
            performance: params.performance * 100,
          };
    }
}