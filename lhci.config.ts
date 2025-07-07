import { URL } from "./src/const/url";

module.exports = {
    ci: {
      collect: {
        url: [URL.DK , URL.FI],
        numberOfRuns: 3,
        settings: {
          emulatedFormFactor: 'mobile',
        },
      },
      upload: {
        target: 'filesystem',
        outputDir: '.',
        filename: 'report.lighthouse.report.json',
      },
    },
  };