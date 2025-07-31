import { Octokit } from "@octokit/rest";
import { Report } from "../domain/report.ts";


export class CreateReport {
    private octokit: Octokit;

    constructor(token: string) {
      this.octokit = new Octokit({ auth: token });
    }

    public async execute(
        filename: string,
        content: string,
        type: string,
        performance: number,
        dryRun: boolean = false
      ): Promise<Report> {
        try {
          const description = `Lighthouse Report - ${type.toUpperCase()} (${Math.round(
            performance * 100
          )}% performance)`;
    
          if (dryRun) {
            const id = `dummy-${type}-${Date.now()}`;
            console.log(
              `🧪 DRY RUN: Would create gist with description: "${description}"`
            );
            console.log(`📁 Filename: ${filename}`);
            console.log(`💾 Content size: ${content.length} characters`);
    
            return {
              type,
              id,
              viewerUrl: `https://googlechrome.github.io/lighthouse/viewer/?gist=${id}`,
              filename,
              performance: performance * 100,
            };
          }
    
          const response = await this.octokit.gists.create({
            files: { [filename]: { content } },
            public: false,
            description,
          });
    
          const id = response.data.id;
          const viewerUrl = `https://googlechrome.github.io/lighthouse/viewer/?gist=${id}`;
    
          return {
            type,
            id: id ?? "",
            viewerUrl,
            filename,
            performance: performance * 100,
          };
        } catch (err) {
          console.error(`❌ Error creating gist for ${type}:`, err);
          throw err;
        }
      }
}