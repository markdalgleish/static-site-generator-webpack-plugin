const path = require('path');
const { promisify } = require('es6-promisify');
const clean = require('rimraf');
const dirCompare = require('dir-compare');
const webpack = promisify(require('webpack'));
const rimrafAsync = promisify(require('rimraf'));
const getSubDirsSync = require('./utils/get-sub-dirs-sync');
const dirContentsToObject = require('./utils/dir-contents-to-object');
const directoryContains = require('./utils/directory-contains-html');

const successCases = getSubDirsSync(__dirname + '/success-cases');
const errorCases = getSubDirsSync(__dirname + '/error-cases');

jest.setTimeout(20000);

describe('Success cases', () => {
  getSubDirsSync(__dirname + '/success-cases').forEach(testCaseName => {
    describe(testCaseName, () => {
      const testCaseRoot = __dirname + '/success-cases/' + testCaseName;

      beforeAll(() => rimrafAsync(testCaseRoot + '/actual-output/'));

      it('should generate the expected files', () => {
        return webpack(require(path.join(testCaseRoot, 'webpack.config.js')))
          .then(() => dirContentsToObject(testCaseRoot + '/actual-output'))
          .then(files => {
            expect(files).toMatchSnapshot();
          });
      });
    });
  });
});

describe('Error cases', () => {
  errorCases.forEach(errorCase => {
    describe(errorCase, () => {
      beforeEach(() =>
        rimrafAsync(__dirname + '/error-cases/' + errorCase + '/actual-output')
      );

      it('generates the expected error', () => {
        const webpackConfig = require('./error-cases/' +
          errorCase +
          '/webpack.config.js');
        const expectedError = require('./error-cases/' +
          errorCase +
          '/expected-error.js');

        return webpack(webpackConfig).then(stats => {
          const actualError = stats.compilation.errors[0]
            .toString()
            .split('\n')[0];
          expect(actualError).toContain(expectedError);
        });
      });
    });
  });
});
