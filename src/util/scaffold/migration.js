/**
 * @module migration.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

// System Modules
import fs from                          'fs';
import util from                        'util';
import { argv } from                    'yargs';

// Angie ORM Modules
import { default as router } from       '../../databases/router';

const TABLE_TEMPLATE = fs.readFileSync(
    `${__dirname}/../../templates/template.table.sql.txt`, 'utf8'
);

export default function() {
    const DATABASE = router(argv.database || argv.d || 'default'),
        TABLE_FILE = util.format(TABLE_TEMPLATE, 'angie_migrations');

    // The very first thing we want to do here is load our migrations
    return DATABASE.$$run(null, TABLE_FILE)
        .then(function(q) {
            return DATABASE.$$run(null, 'SELECT * from angie_migrations;');
        }).then(function(q) {
            console.log(q);
        }).catch(function(e) {
            console.log(e, e.stack);
        });
}