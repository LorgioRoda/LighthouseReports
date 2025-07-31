import { Octokit } from "@octokit/rest";
import { CreateReport } from "./application/create-report.ts";
import { GetToken } from "../../get-token.ts";
import { CreateReportGits } from "./infrastructure/create-report-gits.ts";


export class DependencyContainer {
  private static instance: DependencyContainer;
  
  private constructor() {}
  
  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  createReportUseCase(): CreateReport {
    const octokit = new Octokit({ auth: GetToken.getToken() });
    const reportRepository = new CreateReportGits(octokit);
    return new CreateReport(reportRepository);
  }
}