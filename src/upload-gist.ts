import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface ManifestRun {
  url: string;
  isRepresentativeRun: boolean;
  htmlPath: string;
  jsonPath: string;
  summary: {
    performance: number;
    accessibility: number;
    "best-practices": number;
    seo: number;
    pwa: number;
  };
}

interface CliArgs {
  file?: string;
  gist?: string;
}

class LighthouseGistUploader {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }


  private readManifest(): ManifestRun[] {
    try {
      const manifestContentDesktop = fs.readFileSync("./.lighthouse-reports/desktop/manifest.json", "utf-8");
      const manifestContentMobile = fs.readFileSync("./.lighthouse-reports/mobile/manifest.json", "utf-8");
      console.log([...JSON.parse(manifestContentDesktop), ...JSON.parse(manifestContentMobile)]);
      
      return [...JSON.parse(manifestContentDesktop), ...JSON.parse(manifestContentMobile)];
    } catch (err) {
      console.error("❌ Unable to read manifest.json:", err);
      process.exit(1);
    }
  }


  private findRepresentativeRun(manifest: ManifestRun[]): ManifestRun {
    const representativeRun = manifest.find(run => run.isRepresentativeRun);
    
    if (!representativeRun) {
      console.error("❌ No representative run found in manifest.json");
      process.exit(1);
    }

    return representativeRun;
  }

  private getReportInfo(filePath?: string): { reportPath: string; filename: string } {
    if (filePath) {
      return {
        reportPath: filePath,
        filename: filePath.split("/").pop() || filePath
      };
    }


    const manifest = this.readManifest();
    const representativeRun = this.findRepresentativeRun(manifest);
    const filename = representativeRun.jsonPath.split("/").pop() || "lighthouse-report.json";
    
    console.log(`📊 Using representative run: ${filename}`);
    
    return {
      reportPath: representativeRun.jsonPath,
      filename
    };
  }

  /**
   * Reads the lighthouse report file
   */
  private readReportFile(reportPath: string): string {
    try {
      return fs.readFileSync(reportPath, "utf-8");
    } catch (err) {
      console.error(`❌ Unable to read report file ${reportPath}:`, err);
      process.exit(1);
    }
  }


  private async createGist(filename: string, content: string): Promise<void> {
    try {
      const response = await this.octokit.gists.create({
        files: { [filename]: { content } },
        public: false,
        description: "Lighthouse CI report generated automatically"
      });

      console.log(`✅ Gist created: ${response.data.id}`);
      console.log(`🔗 Viewer: https://googlechrome.github.io/lighthouse/viewer/?gist=${response.data.id}`);
    } catch (err) {
      console.error("❌ Error creating gist:", err);
      process.exit(1);
    }
  }


  private async updateGist(gistId: string, filename: string, content: string): Promise<void> {
    try {
      await this.octokit.gists.update({
        gist_id: gistId,
        files: { [filename]: { content } }
      });

      console.log(`✅ Gist ${gistId} updated successfully`);
      console.log(`🔗 Viewer: https://googlechrome.github.io/lighthouse/viewer/?gist=${gistId}`);
    } catch (err) {
      console.error("❌ Error updating gist:", err);
      process.exit(1);
    }
  }


  async upload(args: CliArgs): Promise<void> {
    const { reportPath, filename } = this.getReportInfo(args.file);
    const content = this.readReportFile(reportPath);

    if (args.gist) {
      await this.updateGist(args.gist, filename, content);
    } else {
      await this.createGist(filename, content);
    }
  }
}


function getGitHubToken(): string {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error("❌ You need to define GH_TOKEN or use GITHUB_TOKEN from Actions");
    process.exit(1);
  }

  return token;
}


function parseArguments(): CliArgs {
  return yargs(hideBin(process.argv))
    .usage("Usage: $0 [--file <path>] [--gist <id>]")
    .option("file", {
      alias: "f",
      type: "string",
      describe: "Path to the Lighthouse JSON report (optional, uses manifest.json by default)"
    })
    .option("gist", {
      alias: "g",
      type: "string",
      describe: "Gist ID to update (omit to create a new one)"
    })
    .help()
    .parseSync();
}


async function main(): Promise<void> {
  const args = parseArguments();
  const token = getGitHubToken();
  const uploader = new LighthouseGistUploader(token);

  await uploader.upload(args);
}

main().catch(err => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});