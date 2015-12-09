// TODO script to run sql files - model sync for JS files
    // TODO make this a migration table!!
        // TODO create before first migration and check
        // TODO store by created and number of migration, name of migration
            // TODO validate name
        // TODO run
            // TODO attempt to create the table in the migration run as well
// TODO add other keys - ability to set indices

/**
 * @module index.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// Global modules
import                                          './angie';

// System Modules
import { argv } from                            'yargs';
import $LogProvider from                        'angie-log';

// Angie ORM Modules
import { default as $$createModel } from        './util/scaffold/table';
import { default as $$createMigration } from    './util/scaffold/migration';

let args = [];

// Remove trivial arguments
process.argv.forEach(function(v) {
    if (!v.match(/(node|iojs|index|angie(\-orm)?)/)) {
        args.push(v);
    }
});

console.log('ARGV', argv._);

// Route the CLI request to a specific command if running from CLI
switch ((args[ 0 ] || argv._ || '').toLowerCase()) {
    case 'create' || 'c':
        switch ((args[ 1 ] || argv._ || '').toLowerCase()) {
            case 'model':
                $$createModel();
                break;
            case 'migration':
                $$createMigration();
        }
        break;
    case 'test':

        // TODO is there any way to carry the stream output from gulp instead
        // of capturing stdout?
        exec(`cd ${__dirname} && gulp`, function(e, std, err) {
            const ERROR = err || e;
            if (ERROR) {
                $LogProvider.error(ERROR);
            } else {
                $LogProvider.info(std);
            }
        });
}