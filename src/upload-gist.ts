import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { fileURLToPath } from "node:url";
import { basename } from "node:path";

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

interface ManifestSource {
  type: "main" | "mobile" | "desktop";
  path: string;
  runs: ManifestRun[];
}

interface CliArgs {
  file?: string;
  gist?: string;
  dryRun?: boolean;
}

interface GistResult {
  type: string;
  gistId: string;
  viewerUrl: string;
  filename: string;
  performance: number;
}

export class LighthouseGistUploader {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /** Read all manifest files from different sources */
  private readAllManifests(): ManifestSource[] {
    const sources: ManifestSource[] = [];

    // Try to read main manifest
    try {
      const mainContent = fs.readFileSync(
        "./.lighthouse-reports/manifest.json",
        "utf-8"
      );
      sources.push({
        type: "main",
        path: "./.lighthouse-reports/manifest.json",
        runs: JSON.parse(mainContent),
      });
      console.log("📋 Main manifest loaded");
    } catch {
      console.log("⚠️  Main manifest not found");
    }

    // Try to read mobile manifest
    try {
      const mobileContent = fs.readFileSync(
        "./.lighthouse-reports/mobile/manifest.json",
        "utf-8"
      );
      sources.push({
        type: "mobile",
        path: "./.lighthouse-reports/mobile/manifest.json",
        runs: JSON.parse(mobileContent),
      });
      console.log("📱 Mobile manifest loaded");
    } catch {
      console.log("⚠️  Mobile manifest not found");
    }

    // Try to read desktop manifest
    try {
      const desktopContent = fs.readFileSync(
        "./.lighthouse-reports/desktop/manifest.json",
        "utf-8"
      );
      sources.push({
        type: "desktop",
        path: "./.lighthouse-reports/desktop/manifest.json",
        runs: JSON.parse(desktopContent),
      });
      console.log("🖥️  Desktop manifest loaded");
    } catch {
      console.log("⚠️  Desktop manifest not found");
    }

    if (sources.length === 0) {
      console.error("❌ No manifest files found");
      process.exit(1);
    }

    return sources;
  }

  /** Find all representative runs from all manifests */
  private findAllRepresentativeRuns(): Array<{ run: ManifestRun; type: string }> {
    const manifests = this.readAllManifests();
    const representativeRuns: Array<{ run: ManifestRun; type: string }> = [];

    for (const manifest of manifests) {
      const representativeRun = manifest.runs.find(
        (run) => run.isRepresentativeRun
      );

      if (representativeRun) {
        representativeRuns.push({
          run: representativeRun,
          type: manifest.type,
        });
        console.log(
          `✅ Found representative run for ${manifest.type}: Performance ${Math.round(
            representativeRun.summary.performance * 100
          )}%`
        );
      } else {
        console.log(
          `⚠️  No representative run found in ${manifest.type} manifest`
        );
      }
    }

    if (representativeRuns.length === 0) {
      console.error("❌ No representative runs found in any manifest");
      process.exit(1);
    }

    return representativeRuns;
  }

  /** Read lighthouse report file */
  private readReportFile(reportPath: string): string {
    try {
      return fs.readFileSync(reportPath, "utf-8");
    } catch (err) {
      console.error(`❌ Unable to read report file ${reportPath}:`, err);
      throw err;
    }
  }

  /** Create a gist with a descriptive name */
  private async createGist(
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

  /** Upload all representative runs */
  async uploadAll(dryRun: boolean = false): Promise<GistResult[]> {
    const representativeRuns = this.findAllRepresentativeRuns();
    const results: GistResult[] = [];

    console.log(
      `\n🚀 ${dryRun ? "DRY RUN - " : ""}Uploading ${
        representativeRuns.length
      } representative runs...`
    );

    for (const { run, type } of representativeRuns) {
      console.log(`\n📤 Processing ${type} report...`);

      try {
        const content = this.readReportFile(run.jsonPath);
        const filename =
          run.jsonPath.split("/").pop() || `lighthouse-${type}.json`;

        const result = await this.createGist(
          filename,
          content,
          type,
          run.summary.performance,
          dryRun
        );
        results.push(result);

        if (dryRun) {
          console.log(`🧪 ${type.toUpperCase()} gist simulation completed`);
        } else {
          console.log(`✅ ${type.toUpperCase()} gist created: ${result.gistId}`);
          console.log(`🔗 Viewer: ${result.viewerUrl}`);
        }
      } catch (err) {
        console.error(`❌ Failed to upload ${type} report:`, err);
      }
    }

    return results;
  }

  /** Display summary of all created gists */
  displaySummary(results: GistResult[], dryRun: boolean = false): void {
    console.log(
      `\n📊 SUMMARY - ${results.length} ${
        dryRun ? "Simulated " : ""
      }Gists ${dryRun ? "Would Be " : ""}Created:`
    );
    console.log("━".repeat(80));

    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.type.toUpperCase()}`);
      console.log(`   📈 Performance: ${Math.round(result.performance)}%`);
      console.log(`   🆔 Gist ID: ${result.gistId}`);
      console.log(`   🔗 Viewer: ${result.viewerUrl}`);
      console.log("");
    });

    const avgPerformance =
      results.reduce((sum, r) => sum + r.performance, 0) / results.length;
    console.log(`📊 Average Performance: ${Math.round(avgPerformance)}%`);
  }
}

function getGitHubToken(dryRun: boolean = false): string {
  if (dryRun) {
    return "dummy_token_for_dry_run";
  }

  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

  if (!token) {
    console.error(
      "❌ You need to define GH_TOKEN or use GITHUB_TOKEN from Actions"
    );
    process.exit(1);
  }

  return token;
}

function parseArguments(): CliArgs {
  return yargs(hideBin(process.argv))
    .usage("Usage: $0 [options]")
    .option("file", {
      alias: "f",
      type: "string",
      describe: "Path to a specific Lighthouse JSON report (optional)",
    })
    .option("gist", {
      alias: "g",
      type: "string",
      describe: "Gist ID to update (for single file mode only)",
    })
    .option("dry-run", {
      alias: "d",
      type: "boolean",
      describe: "Test mode - don't upload to GitHub, just simulate",
    })
    .help()
    .parseSync();
}

async function main(): Promise<void> {
  console.log("🚀 Lighthouse Gist Uploader - Multiple Reports Mode");
  console.log("━".repeat(50));

  const args = parseArguments();
  const dryRun = args.dryRun || false;
  const token = getGitHubToken(dryRun);
  const uploader = new LighthouseGistUploader(token);

  if (dryRun) {
    console.log("🧪 DRY RUN MODE - No actual uploads will be made");
    console.log("━".repeat(50));
  }

  try {
    const results = await uploader.uploadAll(dryRun);
    uploader.displaySummary(results, dryRun);

    if (dryRun) {
      console.log(
        "🧪 Dry run completed successfully! Use without --dry-run to actually upload."
      );
    } else {
      console.log("✅ All uploads completed successfully!");
    }
  } catch (err) {
    console.error("❌ Upload process failed:", err);
    process.exit(1);
  }
}

const isDirectRun = (() => {
  if (typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID)) {
    return false;
  }
  return process.argv.length > 1 && process.argv.some(arg => arg.includes('upload-gist'));
})();

if (isDirectRun) {
  main().catch((err) => {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  });
}
