module.exports = {
    ci: {
      collect: {
        url: [
          'https://www.cupraofficial.es/carshop/w/model?wf=cupra-es-es&id=ePl9IIpVw_Cws2OQj6efq663b4ATiucdfXzAgn4R-gawaMYSGo6Bun4GPrqBho5AeTdDEwWjSKNIENPUTAEEHAPxhBcxmmsB9lUwvA&carline=CARLINE-GROUP-KMP',
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