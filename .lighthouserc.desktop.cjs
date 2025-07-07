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
          width: 1024,
          height: 850,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouse-reports/desktop',
    },
  },
};