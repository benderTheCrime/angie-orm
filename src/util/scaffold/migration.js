/**
 * @module migration.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

//TODO create migration Proto
    // TODO fields for uuid, filename, run or not run DONE
// TODO register model DONE
// TODO create migration file from template DONE
    // TODO date util DONE
    // TODO migration naming from string util DONE
// TODO store migration in project migration folder at root DONE
// TODO store as not run in DB DONE
// TODO select migrations properly from DB DONE


// System Modules
import fs from                              'fs';
import util from                            'util';
import { cyan } from                        'chalk';
import { argv } from                        'yargs';
import $Injector from                       'angie-injector';
import $LogProvider from                    'angie-log';

// Angie ORM Modules
import { default as router } from           '../../databases/router';
import { $$MigrationCreationError } from    '../../services/exceptions/migration-creation-error';
import { $DateUtil } from                   '../util';

const $StringUtil = $Injector.get('$StringUtil'),
    TEMPLATE_PREFIX = `${__dirname}/../../templates/template.`,
    ENCODING = 'utf8',
    TABLE_TEMPLATE = fs.readFileSync(`${TEMPLATE_PREFIX}table.sql.txt`, ENCODING),
    MIGRATION_TEMPLATE =
        fs.readFileSync(`${TEMPLATE_PREFIX}migration.js.txt`, ENCODING),
    TABLE_FILE = util.format(TABLE_TEMPLATE, 'angie_migrations');

export default function() {
    const DATABASE = router(argv.database || argv.d || 'default'),
        MODEL = app.Models.AngieMigrations,
        MIGRATION_NAME = argv._.length > 2 ?
            argv._[ 2 ] : argv.n || argv.name || 'angie-orm-migration',
        CAMEL_NAME = $StringUtil.toCamel(MIGRATION_NAME),
        DASH_NAME = $StringUtil.toDash(MIGRATION_NAME),
        UNDERSCORE_NAME = $StringUtil.toDash(MIGRATION_NAME);

    if (!MIGRATION_NAME) {
        throw new $$MigrationCreationError(1);
    }

    // The very first thing we want to do here is load our migrations
    return DATABASE.$$run(null, TABLE_FILE)
        .then(function() {
            return MODEL.all();
        }).then(function(queryset) {

            // From here, we can parse our newest migration
            const LAST_INDEX = queryset.last() ? queryset.last().id : 0,
                NEXT_INDEX = LAST_INDEX + 1,
                PADDED_NEXT_INDEX = NEXT_INDEX < 10 ?
                    `00${NEXT_INDEX}` : NEXT_INDEX < 100 ?
                        `0${NEXT_INDEX}` : NEXT_INDEX,
                MIGRATION_FILE = util.format(
                    MIGRATION_TEMPLATE,
                    PADDED_NEXT_INDEX,
                    DASH_NAME,
                    $DateUtil.format('mm/dd/yy')
                ),
                MIGRATIONS_DIR = `${process.cwd()}/migrations`,
                FILENAME = `${PADDED_NEXT_INDEX}-${DASH_NAME}.js`;

            try {
                fs.mkdirSync(`${MIGRATIONS_DIR}`);
            } catch(e) {}
            fs.writeFileSync(`${MIGRATIONS_DIR}/${FILENAME}`, MIGRATION_FILE);

            return MODEL.create({
                uuid: PADDED_NEXT_INDEX,
                filename: FILENAME,
                active: false
            });
        }).then(function() {
            $LogProvider.info(`Successfully created migration ${MIGRATION_NAME}`);
            process.exit(0);
        }).catch(function(e) {
            $LogProvider.error(e);
            process.exit(1);
        });
}