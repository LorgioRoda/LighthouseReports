import { HandleManifest } from "../../src/core/reports/application/handle-manifest";
import { ManifestRepository } from "../../src/core/reports/domain/manifest-repository";
import { ManifestSource } from "../../src/core/reports/domain/manifest";
import { FileReader } from "../../src/core/reports/domain/file-reader";
import { ReportRepository } from "../../src/core/reports/domain/report-repository";
import { Report } from "../../src/core/reports/domain/report";
import { CreateReport } from "../../src/core/reports/application/create-report";
import { CreateReportsFromManifest } from "../../src/core/reports/application/create-reports-from-manifest";

class FakeFileReader implements FileReader {
    read(path: string): string {
        return '{"fake": true}';
    }
}


  class FakeManifest implements ManifestRepository {
    readAllManifests(): ManifestSource[] {
      return [{
        type: "mobile",
        path: "fake/manifest.json",
        runs: [{
          url: ["http://test.com"],
          isRepresentativeRun: true,
          htmlPath: "test.html",
          jsonPath: "test.json",
          summary: { performance: 0.9, accessibility: 0.8, "best-practices": 0.7, seo: 0.6, pwa: 0 },
        }],
      }];
    }
  }

class FakeReportRepository implements ReportRepository{
    public lastParams: any = null
    async createReport (params:{
        filename: string;
        content: string;
        description: string;
        type: string;
        testUrl: string;
        performance: number;
    }): Promise<Report>  {
        this.lastParams = params
        return {
            type: params.type,
            testUrl: params.testUrl,
            id: 'fake-id',
            viewerUrl: 'fake.com',
            filename: params.filename,
            performance: params.performance * 100,
        }
    }
}

describe('create-reports-from-manifest', () => {
    it("should content url, id and file", async () => {
        const handleManifest = new HandleManifest(new FakeManifest());
        const createReport = new CreateReport(new FakeReportRepository());
        const uploader = new CreateReportsFromManifest(handleManifest, new FakeFileReader(), createReport);
        const results = await uploader.execute();

        expect(results[0].viewerUrl).toBe("fake.com");
        expect(results[0].id).toBe("fake-id");
        expect(results[0].filename).toBe("test.json");
        expect(results[0].testUrl).toBe("http://test.com");

    })
 })
