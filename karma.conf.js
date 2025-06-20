// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    browsers: ['Chrome'],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
        failSpecWithNoExpectations: true,
        forbidDuplicateNames: true,
        // seed: '32615',
        timeoutInterval: 250,
      },
    },
    coverageReporter: {
      check: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
      // GitHub Pages will only serve HTML below the docs folder at project root.
      dir: require('path').join(__dirname, './docs/coverage'),
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
      ],
      subdir: '.',
    },
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    reporters: ['progress', 'kjhtml'],
    reportSlowerThan: 100,
    restartOnFileChange: true,
  });
};
