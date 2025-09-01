module.exports = {
    ci: {
      collect: {
        url: [
          // 'https://www.cupraofficial.dk/carshop/w/model',
          'https://www.audi.es/es/modelos/',
          // 'https://configurator.porsche.com/es-ES/model-start',
          // 'https://cc.skoda-auto.com/esp/es-ES/',
          // 'https://www.volkswagen.es/es/configurador.html',
          // 'https://www.toyota.es/coches',
          // 'https://www.ford.es/turismos?intcmp=Build-Your-Ford',
          // 'https://www.mercedes-benz.es/passengercars/models.html'
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