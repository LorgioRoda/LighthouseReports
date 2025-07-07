module.exports = {
  ci: {
    collect: {
      url: [
        'https://www.cupraofficial.dk/carshop/w/model',
      ],
      numberOfRuns: 3,
      settings: {
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
        },
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouse-reports/desktop',
    },
  },
};