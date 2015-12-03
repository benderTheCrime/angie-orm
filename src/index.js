// TODO a layer of abstraction must be built on top of this
    // TODO figure out how proto and model interact
    // TODO encoding and decoding must happen as a byproduct of the query/queryset
// TODO no migrations and the same format of models implies models largely unchanged

// TODO no such thing as update, only create (delete old)

// TODO script to run sql files - model sync for JS files
// TODO refactor Exceptions, refactor Util
// TODO add other keys?
// TODO remove this.database references in basemodel, remove, "run" in connections

/**
 * @module index.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// Global modules
import                                          './angie';

// System Modules
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
switch ((args[ 0 ] || '').toLowerCase()) {
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
        break;
}