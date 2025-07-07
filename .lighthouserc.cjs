module.exports = {
    ci: {
      collect: {
        url: [
          'https://www.cupraofficial.dk/carshop/w/model',
          'https://www.cupraofficial.fi/carshop/w/model'
        ],
        numberOfRuns: 3,
        settings: {
          formFactor: 'mobile',
          throttling: {
            rttMs: 40,
            throughputKbps: 10 * 1024,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0
          },
          screenEmulation: {
            mobile: true,
            width: 412,
            height: 823,
            deviceScaleFactor: 1.75,
            disabled: false,
          },
        },
      },
      upload: {
        target: 'filesystem',
        outputDir: '.',
      },
    },
  };