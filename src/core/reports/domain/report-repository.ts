import { Report } from "./report.ts";

export interface ReportRepository {
  execute(params: {
    filename: string;
    content: string;
    description: string;
    type: string;
    performance: number;
  }): Promise<Report>;
} 