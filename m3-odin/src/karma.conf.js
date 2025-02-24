// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
   config.set({
      basePath: "",
      frameworks: ["jasmine", "@angular-devkit/build-angular"],
      plugins: [
         require('karma-jasmine'),
         require('karma-chrome-launcher'),
         require('karma-jasmine-html-reporter'),
         require('karma-coverage'),
         require('@angular-devkit/build-angular/plugins/karma')
      ],
      files: [
         { pattern: "../node_modules/jquery/dist/jquery.js", watched: false },
         { pattern: "../node_modules/d3/dist/d3.js", watched: false },
         {
            pattern: "../node_modules/ids-enterprise/dist/js/sohoxi.js",
            watched: false,
         },
         {
            pattern: "../node_modules/ids-enterprise/dist/js/cultures/en-US.js",
            watched: false,
         },
         {
            pattern:
               "../node_modules/ids-enterprise/dist/css/theme-new-light.css",
            watched: false,
         },
      ],
      client: {
         clearContext: false, // leave Jasmine Spec Runner output visible in browser
      },
      coverageReporter: {
         dir: require('path').join(__dirname, '../coverage/m3-odin-samples'),
         reporters: [
            { type: 'html' },
            { type: 'text-summary' }
         ],
         fixWebpackSourcePaths: true,
         check: {
            global: {
              statements: 10,
              branches: 1,
              functions: 3,
              lines: 10
            }
         },
      },
      reporters: ['progress', 'kjhtml'],
      port: 9876,
      colors: true,
      logLevel: config.LOG_INFO,
      autoWatch: true,
      browsers: ['Chrome'],
      singleRun: true,
      customLaunchers: {
         ChromeHeadlessCI: {
           base: 'ChromeHeadless',
           flags: ['--no-sandbox'],
         },
       },   
   });
};
