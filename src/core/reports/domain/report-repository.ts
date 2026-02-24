import { Report } from "./report.ts";

export interface ReportRepository {
  createReport(params: {
    filename: string;
    content: string;
    description: string;
    type: string;
    testUrl: string;
    performance: number;
  }): Promise<Report>;
} 