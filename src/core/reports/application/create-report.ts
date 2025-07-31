import { Octokit } from "@octokit/rest";

interface GistResult {
    type: string;
    gistId: string;
    viewerUrl: string;
    filename: string;
    performance: number;
  }

export class CreateReport {
    private octokit: Octokit;

    constructor(token: string) {
      this.octokit = new Octokit({ auth: token });
    }

    public async createGist(
        filename: string,
        content: string,
        type: string,
        performance: number,
        dryRun: boolean = false
      ): Promise<GistResult> {
        try {
          const description = `Lighthouse Report - ${type.toUpperCase()} (${Math.round(
            performance * 100
          )}% performance)`;
    
          if (dryRun) {
            const dummyGistId = `dummy-${type}-${Date.now()}`;
            console.log(
              `🧪 DRY RUN: Would create gist with description: "${description}"`
            );
            console.log(`📁 Filename: ${filename}`);
            console.log(`💾 Content size: ${content.length} characters`);
    
            return {
              type,
              gistId: dummyGistId,
              viewerUrl: `https://googlechrome.github.io/lighthouse/viewer/?gist=${dummyGistId}`,
              filename,
              performance: performance * 100,
            };
          }
    
          const response = await this.octokit.gists.create({
            files: { [filename]: { content } },
            public: false,
            description,
          });
    
          const gistId = response.data.id;
          const viewerUrl = `https://googlechrome.github.io/lighthouse/viewer/?gist=${gistId}`;
    
          return {
            type,
            gistId: gistId ?? "",
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