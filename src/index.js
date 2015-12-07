// TODO a layer of abstraction must be built on top of this
    // TODO no such thing as update, only create (delete old)
        // TODO TEST delete one DONE
        // TODO TEST delete many
        // TODO TEST update one DONE
        // TODO TEST update many
    // TODO filter querysets have to be performed after decodes
        // TODO fetch and filter, filter and fetch are called downstream of all
            // TODO fetch
            // TODO base filter
            // TODO filter many
// TODO script to run sql files - model sync for JS files
// TODO refactor Exceptions, refactor Util, error in base-connection
// TODO move fields and field errors to separate files
// TODO move the db object, model separate
// TODO add fields, type checking on fields
    // TODO add float
    // TODO check to see if values change?
// TODO change all instances of run to $$run
// TODO add other keys - ability to set indices
// TODO remove this.database references in basemodel, remove, "run" in connections

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

let args = [];

// Remove trivial arguments
process.argv.forEach(function(v) {
    if (!v.match(/(node|iojs|index|angie(\-orm)?)/)) {
        args.push(v);
    }
});

// Route the CLI request to a specific command if running from CLI
switch ((args[ 0 ] || argv._ || '').toLowerCase()) {
    case 'create' || 'c':
        $$createModel();
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