import { Report } from "./core/reports/domain/report.ts";
import { DependencyContainer } from "./core/reports/dependency-container.ts";

function displaySummary(results: Report[]): void {
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.type.toUpperCase()}`);
    console.log(`   📈 Performance: ${Math.round(result.performance)}%`);
    console.log(`   🆔 Gist ID: ${result.id}`);
    console.log(`   🔗 Viewer: ${result.viewerUrl}`);
    console.log("");
  });

  const avgPerformance =
    results.reduce((sum, r) => sum + r.performance, 0) / results.length;
  console.log(`📊 Average Performance: ${Math.round(avgPerformance)}%`);
}

async function main(): Promise<void> {
  console.log("🚀 Lighthouse Gist Uploader - Multiple Reports Mode");
  console.log("━".repeat(50));

  const container = DependencyContainer.getInstance();
  const createReports = container.createReportsFromManifestUseCase();

  try {
    const results = await createReports.execute();
    displaySummary(results);
  } catch (err) {
    console.error("Upload process failed:", err);
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
