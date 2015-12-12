        // TODO run
            // TODO attempt to create the table in the migration run as well
            // TODO check to see if the migration has been fun by filename after
            // reading the dir
            // TODO injection bind migration files
// TODO refactor angie-injector exceptions
// TODO add other keys - ability to set indices
// TODO shrinkwrap
// TODO test/doc
// TODO hook up to coveralls

// TODO release log, injector
// TODO release angie
// TODO release this
// TODO bindings

/**
 * @module index.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// Global modules
import                                          './angie';
import                                          './models/angie-migrations.model';

// System Modules
import { argv } from                            'yargs';
import $LogProvider from                        'angie-log';

// Angie ORM Modules
import { default as $$createModel } from        './util/scaffold/table';
import { default as $$createMigration } from    './util/scaffold/migration';
import { $$migrateAll, $$migrate } from         './util/invoke/migrations';

const ERR = c => `No valid ${c} command component specified, please see the ` +
        "help commands for more options",
    TYPE = argv._[ 1 ] || '';

// Route the CLI request to a specific command if running from CLI
switch ((argv._[ 0 ] || '').toLowerCase()) {
    case 'create':
        handleCreationTask();
        break;
    case 'c':
        handleCreationTask();
        break;
    case 'run':
        handleRunTask();
        break;
    case 'r':
        handleRunTask();
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

function handleCreationTask() {
    switch (TYPE.toLowerCase()) {
        case 'model':
            $$createModel();
            break;
        case 'migration':
            $$createMigration();
            break;
        default:
            $LogProvider.error(ERR('create'));
    }
}

function handleRunTask() {
    switch (TYPE.toLowerCase()) {
        case 'migrations':
            $$migrateAll();
            break;
        case 'migration':
            $$migrate();
            break;
        default:
            $LogProvider.error(ERR('run'));
    }
}