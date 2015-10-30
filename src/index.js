/**
 * @module index.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// System Modules
import { exec } from                'child_process';
import { bold, gray } from          'chalk';
import $LogProvider from            'angie-log';

// Angie ORM Global Modules
import './Angie';

// Angie ORM Modules
import AngieDatabaseRouter from     './databases/AngieDatabaseRouter';
import * as $$FieldProvider from    './models/$Fields';

const p = process;
let args = [];

// Remove trivial arguments
p.argv.forEach(function(v) {
    if (!v.match(/(node|iojs|index|help|angie(\-orm)?)/)) {
        args.push(v);
    } else if (v === 'help') {
        help();
    }
});

// Route the CLI request to a specific command if running from CLI
if (
    args.length &&
    args.some(v => [ 'syncdb', 'migrate', 'test' ].indexOf(v) > -1)
) {
    switch ((args[0] || '').toLowerCase()) {
        case 'syncdb':
            console.log('in dbsync');
            AngieDatabaseRouter(args).sync();
            break;
        case 'migrate':
            console.log('in migrate');
            AngieDatabaseRouter(args).migrate();
            break;
        default:
            runTests();
    }
}

function runTests() {

    // TODO is there any way to carry the stream output from gulp instead
    // of capturing stdout?
    exec(`cd ${__dirname} && gulp`, function(e, std, err) {
        $LogProvider.info(std);
        if (err) {
            $LogProvider.error(err);
        }
        if (e) {
            throw new Error(e);
        }
    });
}

function help() {
    console.log(bold('Angie ORM'));
    console.log('A Feature-Complete Database Relationship Manager Designed for NodeJS');
    console.log('\r');
    console.log(bold('Version:'));
    console.log(global.ANGIE_ORM_VERSION);
    console.log('\r');
    console.log(bold('Commands:'));
    console.log('syncdb [ database ]');
    console.log(gray(
        'Sync the current specified databases in the AngieFile. ' +
        'Defaults to the default created database'
    ));
    console.log('migrations [ --destructive -- optional ] [ --dryrun -- optional ]');
    console.log(gray(
        'Checks to see if the database and the specified ' +
        'models are out of sync. Generates NO files.'
    ));
    console.log('test');
    console.log(gray(
        'Runs the Angie test suite and prints the results in the ' +
        'console'
    ));
}

export { $$FieldProvider as $$Fields };