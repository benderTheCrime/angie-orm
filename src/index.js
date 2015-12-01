// TODO - Create table scaffold, add angie and angie orm cli commands
// TODO figure out what secondary DB to communicate with
// TODO protobuf files must be loaded in and registered with Model/model
// TODO a layer of abstraction must be built on top of this
// TODO no migrations and the same format of models implies models largely unchanged
// TODO don't use required
// TODO script to run sql files - model sync for JS files
// TODO refactor Exceptions


/**
 * @module index.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

import                                          './new-angie';
import { default as $$createModel } from        './util/scaffold/table';

let args = [];

// Remove trivial arguments
process.argv.forEach(function(v) {
    if (!v.match(/(node|iojs|index|angie(\-orm)?)/)) {
        args.push(v);
    }
});

// Route the CLI request to a specific command if running from CLI
switch ((args[0] || '').toLowerCase()) {
    case 'create':
        $$createModel();
        break;
    case 'c':
        $$createModel();
        break;
    case 'test':
        runTests();
        break;
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