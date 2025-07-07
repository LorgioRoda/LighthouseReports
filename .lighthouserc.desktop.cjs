module.exports = {
    ci: {
      collect: {
        url: [
          'https://www.cupraofficial.dk/carshop/w/model',
        ],
        numberOfRuns: 3,
      },
      upload: {
        target: 'filesystem',
        outputDir: './.lighthouse-reports/desktop',
      },
    },
  };