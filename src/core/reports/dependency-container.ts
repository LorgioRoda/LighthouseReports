import { Octokit } from "@octokit/rest";
import { CreateReport } from "./application/create-report.ts";
import { CreateReportsFromManifest } from "./application/create-reports-from-manifest.ts";
import { HandleManifest } from "./application/handle-manifest.ts";
import { GetToken } from "../../get-token.ts";
import { CreateReportGits } from "./infrastructure/create-report-gits.ts";
import { ManifestReader } from "./infrastructure/manifest-reader.ts";
import { FileReaderSystem } from "./infrastructure/file-reader-system.ts";


export class DependencyContainer {
  private static instance: DependencyContainer;

  private constructor() {}

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  createReportsFromManifestUseCase(reportsBasePath?: string): CreateReportsFromManifest {
    return new CreateReportsFromManifest(
      new HandleManifest(new ManifestReader(reportsBasePath)),
      new FileReaderSystem(),
      this.createReportUseCase(),
    );
  }

  private createReportUseCase(): CreateReport {
    const octokit = new Octokit({ auth: GetToken.getToken() });
    const reportRepository = new CreateReportGits(octokit);
    return new CreateReport(reportRepository);
  }
}