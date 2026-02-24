import * as fs from "fs";
import * as path from "path";
import { Report } from "./core/reports/domain/report.ts";
import { DependencyContainer } from "./core/reports/dependency-container.ts";

function displaySummary(results: Report[]): void {
  console.log("Lighthouse Report Results");
  console.log("=".repeat(50));

  results.forEach((result) => {
    console.log(`${result.type.toUpperCase()} - ${result.testUrl}`);
    console.log(`  Performance: ${Math.round(result.performance)}%`);
    console.log(`  Viewer: ${result.viewerUrl}`);
    console.log("");
  });

  const avgPerformance =
    results.reduce((sum, r) => sum + r.performance, 0) / results.length;
  console.log(`Average Performance: ${Math.round(avgPerformance)}%`);
}

async function main(): Promise<void> {
  const workspacePath = process.argv[2] || ".";
  const reportsBasePath = path.join(workspacePath, ".lighthouse-reports");

  const container = DependencyContainer.getInstance();
  const createReports = container.createReportsFromManifestUseCase(reportsBasePath);

  const results = await createReports.execute();
  displaySummary(results);

  const resultsPath = path.join(workspacePath, "results.json");
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`Results written to ${resultsPath}`);
}

main().catch((err) => {
  console.error("Action failed:", err);
  process.exit(1);
});
