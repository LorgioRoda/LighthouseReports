import { Report } from "../../core/reports/domain/report.ts";

export const createReportAdapter = (gits: any): Report => {
    const id = gits.id;
    const viewerUrl = `https://googlechrome.github.io/lighthouse/viewer/?gist=${id}`;
    return {
        id: id ?? "",
        viewerUrl: viewerUrl,
        filename: gits.files[0].filename,
        performance: 0,
        type: gits.type ?? "",
    }
}