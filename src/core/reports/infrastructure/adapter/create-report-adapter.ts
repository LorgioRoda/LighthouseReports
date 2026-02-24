import { Report } from "../../domain/report.ts";

export const createReportAdapter = (gits: any): Report => {
    const id = gits.id;
    const viewerUrl = `https://googlechrome.github.io/lighthouse/viewer/?gist=${id}`;
    return {
        id: id ?? "",
        viewerUrl: viewerUrl,
        filename: gits.files,
        performance: 0,
        type: gits.type ?? "",
        testUrl: "",
    }
}