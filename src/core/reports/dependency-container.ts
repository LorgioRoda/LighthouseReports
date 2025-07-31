import { Octokit } from "@octokit/rest";
import { CreateReport } from "./application/create-report";
import { GetToken } from "../../get-token";
import { CreateReportGits } from "./infrastructure/create-report-gits";


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