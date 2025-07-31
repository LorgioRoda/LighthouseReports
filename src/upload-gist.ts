import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { GetToken } from "./get-token.ts";
import { HandleManifest } from "./core/reports/application/handle-manifest.ts";
import { CreateReport } from "./core/reports/application/create-report.ts";


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


  /** Read lighthouse report file */
  private readReportFile(reportPath: string): string {
    try {
      return fs.readFileSync(reportPath, "utf-8");
    } catch (err) {
      console.error(`❌ Unable to read report file ${reportPath}:`, err);
      throw err;
    }
  }

  /** Upload all representative runs */
  async uploadAll(dryRun: boolean = false): Promise<GistResult[]> {
    const representativeRuns = new HandleManifest().findAllRepresentativeRuns();
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

        const result = await new CreateReport(GetToken.getToken()).createGist(
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
  const uploader = new LighthouseGistUploader();

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
