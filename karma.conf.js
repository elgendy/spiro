// Karma configuration
// Generated on Thu Jul 25 2013 16:24:24 GMT+0100 (GMT Daylight Time)


// base path, that will be used to resolve files and exclude
basePath = '';


// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
    
  'Spiro.Angular/Scripts/underscore.min.js',
  'Spiro.Angular/Scripts/angular.min.js',
  'Spiro.Angular/Scripts/angular-resource.min.js',
  'Spiro.Angular/Scripts/angular-mocks.js',  
  'Spiro.Angular/Scripts/spiro.models.helpers.js',
  'Spiro.Angular/Scripts/spiro.models.shims.js',
  'Spiro.Angular/Scripts/spiro.models.js',
 
  'Spiro.Angular/Scripts/spiro.angular.app.js',
  'Spiro.Angular/Scripts/spiro.angular.viewmodels.js',
  'Spiro.Angular/Scripts/spiro.angular.controllers.js',
  
  'Spiro.Angular/Tests/specs/*.js'
];


// list of files to exclude
exclude = [
  
];

preprocessors = {
  'Spiro.Angular/Scripts/spiro.*.js': 'coverage'
};


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress', 'junit', 'coverage' ];


coverageReporter = {
  type : 'cobertura',
  dir : 'coverage/'
}


junitReporter = {
    outputFile: 'test-results/karma-test-results.xml'
};

// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Firefox'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = true;
