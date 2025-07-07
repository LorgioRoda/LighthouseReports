import { URL } from "./src/const/url";

module.exports = {
    ci: {
      collect: {
        url: ['https://www.cupraofficial.dk/carshop/w/model'],
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