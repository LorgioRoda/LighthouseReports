import { Octokit } from "@octokit/rest";
import { Report } from "../core/reports/domain/report.ts";
import { createReportAdapter } from "./adapter/create-report-adapter.ts";

export class CreateReportGits {
    constructor(private readonly octokit: Octokit) {
        this.octokit = octokit;
    }

    public async execute(filename: string, content: string, description: string, type: string, performance: number): Promise<Report> {
        const response = await this.octokit.gists.create({
            files: { [filename]: { content } },
            public: false,
            description,
          });
          const res = createReportAdapter(response.data);
    
          return {
            type,
            id: res.id,
            viewerUrl: res.viewerUrl,
            filename,
            performance: performance * 100,
          };
    }
}