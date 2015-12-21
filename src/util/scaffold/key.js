/**
 * @module migration.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

// System Modules
import fs from                      'fs';
import util from                    'util';
import { argv } from                'yargs';
import { cyan } from                'chalk';
import $Injector from               'angie-injector';
import $LogProvider from            'angie-log';

// Angie ORM Modules
import { default as router } from   '../../databases/router';

const $StringUtil = $Injector.get('$StringUtil'),
    KEY_TEMPLATE = fs.readFileSync(
        `${__dirname}/../../templates/template.key.sql.txt`, 'utf8'
    );

export default function() {
    const DATABASE = router(argv.database || argv.d || 'default'),
        MODEL_NAME = argv._.length > 3 ? argv._[ 2 ] : argv.model || argv.m,
        UNDERSCORE_MODEL_NAME = $StringUtil.toUnderscore(MODEL_NAME),
        KEY_NAME = argv._.length > 3 ? argv._[ 3 ] : argv._[ 2 ],
        KEY_FILE = util.format(
            KEY_TEMPLATE, UNDERSCORE_MODEL_NAME, KEY_NAME, KEY_NAME, KEY_NAME
        );

    return DATABASE.$$run(null, KEY_FILE).then(function(q) {
        $LogProvider.info(
            `Successfully added key ${
                cyan(KEY_NAME)
            } to model ${cyan(MODEL_NAME)}`
        );
        process.exit(0);
    }, error).catch(error);
}

function error(e) {
    $LogProvider.error(e);
    process.exit(1);
}