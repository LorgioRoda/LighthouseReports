import { CreateReport } from "../../src/core/reports/application/create-report";
import { Report } from "../../src/core/reports/domain/report";
import { ReportRepository } from "../../src/core/reports/domain/report-repository";

class FakeReportRepository implements ReportRepository{
    public lastParams: any = null
    async createReport (params:{
        filename: string;
        content: string;
        description: string;
        type: string;
        performance: number;
    }): Promise<Report>  {
        this.lastParams = params
        return {
            type: params.type,
            id: 'fake-id',
            viewerUrl: 'fake.com',
            filename: params.filename,
            performance: params.performance * 100,
        }
    }
}

class FakeReportRepositoryWithError implements ReportRepository {
      async createReport(params: any): Promise<Report> {
          throw new Error("GitHub API failed");
      }
  }

describe('CreateReport', () => {
    it('should create a description', async ()  => {
        const fakeRepo = new FakeReportRepository()
        const createReport = new CreateReport(fakeRepo)
        await createReport.execute("report.json", "{}", "mobile", 0.35);
        expect(fakeRepo.lastParams.description).toBe("Lighthouse Report - MOBILE (35% performance)")
    })
    it('should send report data like content, filename, type and performance', async () => {
        const fakeRepo = new FakeReportRepository()
        const createReport = new CreateReport(fakeRepo)
        await createReport.execute("report.json", "{}", "mobile", 0.35);
        expect(fakeRepo.lastParams).toMatchObject( {"content": "{}", "description": "Lighthouse Report - MOBILE (35% performance)", "filename": "report.json", "performance": 0.35, "type": "mobile"})
    })
    it('should return a report with correct fields', async () => {
        const fakeRepo = new FakeReportRepository()
        const createReport = new CreateReport(fakeRepo)
        const report = await createReport.execute("report.json", "{}", "mobile", 0.35);
         expect(report).toMatchObject({
          type: "mobile",
          id: "fake-id",
          viewerUrl: "fake.com",
          filename: "report.json",
          performance: 35
      });
    })
    it('should throw error when repository fails', async () => {
        const fakeRepo = new FakeReportRepositoryWithError()
        const createReport = new CreateReport(fakeRepo)
        const report = createReport.execute("report.json", "{}", "mobile", 0.35);
        await expect(report).rejects.toThrow("GitHub API failed");

    })
 })
