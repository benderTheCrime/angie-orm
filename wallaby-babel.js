const SRC = 'src/**/*.js',
    TEST_SRC = 'test/src/**/*.spec.js';

module.exports = function() {

    // WallabyJS configuration for the WallabyJS JetBrains/Atom plugin
    return {
        files: [ 'AngieFile.json', SRC ],
        tests: [ TEST_SRC ],
        env: {
            type: 'node'
        },
        workers: {
            recycle: true
        },
        preprocessors: {
            '**/*.js': file => require('babel').transform(file.content, {
                sourceMap: true
            })
        }
    };
};