import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export interface CliArgs {
    file?: string;
    gist?: string;
    dryRun?: boolean;
}

export class YargsCliArgsReader {
    parse(): CliArgs {
      return yargs(hideBin(process.argv))
        .usage("Usage: $0 [options]")
        .option("file", { alias: "f", type: "string", describe: "Path to a specific Lighthouse JSON report" })
        .option("gist", { alias: "g", type: "string", describe: "Gist ID to update" })
        .option("dry-run", { alias: "d", type: "boolean", describe: "Test mode - don't upload to GitHub" })
        .help()
        .parseSync();
    }
  }