module.exports = {
  ci: {
    collect: {
      url: [
          'https://www.cupraofficial.es/carshop/w/model?wf=cupra-es-es&id=ePl9IIpVw_Cws2OQj6efq663b4ATiucdfXzAgn4R-gawaMYSGo6Bun4GPrqBho5AeTdDEwWjSKNIENPUTAEEHAPxhBcxmmsB9lUwvA&carline=CARLINE-GROUP-KMP'
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