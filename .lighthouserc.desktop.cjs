module.exports = {
  ci: {
    collect: {
      url: [
          // 'https://www.cupraofficial.dk/carshop/w/model',
          'https://www.tesla.com/es_es/model3/design#overview'
      ],
      numberOfRuns: 3,
      settings: {
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1024,
          height: 850,
          deviceScaleFactor: 1,
          disabled: false,
        },
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouse-reports/desktop',
    },
  },
};