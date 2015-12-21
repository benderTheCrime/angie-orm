// TODO merge into angie-framework, branches and tags

// TODO release angie
    // TODO Add tests
    // TODO review PR code
// TODO shrinkwrap
// TODO remove bin commands?
// TODO release this - flag as a beta release 0.4.0-beta1
// TODO bindings

// TODO test/doc & wallaby
// TODO hook up to coveralls

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
import $Injector from                           'angie-injector';
import $LogProvider from                        'angie-log';

// Angie ORM Modules
import { default as $$createModel } from        './util/scaffold/table';
import { default as $$createMigration } from    './util/scaffold/migration';
import { default as $$createKey } from          './util/scaffold/key';
import { $$migrateAll, $$migrate } from         './util/invoke/migrations';

const $Exceptions = $Injector.get('$Exceptions'),
    TYPE = (argv._[ 1 ] || '').toLowerCase();

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
    switch (TYPE) {
        case 'model':
            $$createModel();
            break;
        case 'key':
            $$createKey();
            break;
        case 'migration':
            $$createMigration();
            break;
        default:
            throw new $Exceptions.$$CommandLineError(1);
    }
}

function handleRunTask() {
    switch (TYPE) {
        case 'migrations':
            $$migrateAll();
            break;
        case 'migration':
            $$migrate();
            break;
        default:
            throw new $Exceptions.$$CommandLineError(2);
    }
}