module.exports = {
    ci: {
      collect: {
        url: [
          // 'https://www.cupraofficial.dk/carshop/w/model',
          'https://www.tesla.com/es_es/model3/design#overview'
        ],
        numberOfRuns: 3,
        settings: {
          formFactor: 'mobile',
        },
      },
      upload: {
        target: 'filesystem',
        outputDir: './.lighthouse-reports/mobile',
      },
    },
  };