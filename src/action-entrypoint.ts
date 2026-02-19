import * as fs from "fs";
import { Report } from "./core/reports/domain/report.ts";
import { DependencyContainer } from "./core/reports/dependency-container.ts";

function displaySummary(results: Report[]): void {
  console.log("Lighthouse Report Results");
  console.log("=".repeat(50));

  results.forEach((result) => {
    console.log(`${result.type.toUpperCase()}`);
    console.log(`  Performance: ${Math.round(result.performance)}%`);
    console.log(`  Viewer: ${result.viewerUrl}`);
    console.log("");
  });

  const avgPerformance =
    results.reduce((sum, r) => sum + r.performance, 0) / results.length;
  console.log(`Average Performance: ${Math.round(avgPerformance)}%`);
}

async function main(): Promise<void> {
  const container = DependencyContainer.getInstance();
  const createReports = container.createReportsFromManifestUseCase();

  const results = await createReports.execute();
  displaySummary(results);

  fs.writeFileSync("results.json", JSON.stringify(results, null, 2));
  console.log("Results written to results.json");
}

main().catch((err) => {
  console.error("Action failed:", err);
  process.exit(1);
});
