// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
   config.set({
      basePath: "",
      frameworks: ["jasmine", "@angular-devkit/build-angular"],
      plugins: [
         require("karma-jasmine"),
         require("karma-chrome-launcher"),
         require("karma-jasmine-html-reporter"),
         require("@angular-devkit/build-angular/plugins/karma"),
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
      reporters: ["progress", "kjhtml"],
      port: 9876,
      colors: true,
      logLevel: config.LOG_INFO,
      autoWatch: true,
      browsers: ["Chrome"],
      singleRun: false,
   });
};
