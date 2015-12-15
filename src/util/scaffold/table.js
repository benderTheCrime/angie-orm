/**
 * @module table.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/06/2015
 */

// System Modules
import fs from                          'fs';
import util from                        'util';
import { argv } from                    'yargs';
import { cyan } from                    'chalk';
import $Injector from                   'angie-injector';
import $LogProvider from                'angie-log';

// Angie ORM Modules
import { default as router } from       '../../databases/router';
import {
    $$InvalidConfigError,
    $$InvalidModelConfigError
} from                                  '../../services/exceptions';
import { $DateUtil } from               '../util';

const $StringUtil = $Injector.get('$StringUtil'),
    TEMPLATE_PREFIX = `${__dirname}/../../templates/template.`,
    ENCODING = 'utf8',
    PROTO_TEMPLATE = fs.readFileSync(`${TEMPLATE_PREFIX}proto.txt`, ENCODING),
    MODEL_TEMPLATE = fs.readFileSync(`${TEMPLATE_PREFIX}model.js.txt`, ENCODING),
    TABLE_TEMPLATE = fs.readFileSync(`${TEMPLATE_PREFIX}table.sql.txt`, ENCODING);

export default function() {

    // If the user did this correctly, there is a name
    // TODO camel and underscore this name
    const PROJECT_NAME = app.$$config.projectName || 'Angie',
        NAME = argv._.length > 3 ? argv._[ 3 ] : argv._[ 2 ],
        DATABASE_NAME = argv._.length > 3 ?
            argv._[ 2 ] : argv.d || argv.database || 'default';

    if (!NAME) {
        throw new $$InvalidModelConfigError();
    }

    if (!PROJECT_NAME) {
        throw new $$InvalidConfigError('projectName');
    }

    const DATABASE = router(DATABASE_NAME),
        DASH_NAME = $StringUtil.toDash(NAME),
        UNDERSCORE_NAME = $StringUtil.toUnderscore(NAME),
        CAMEL_NAME = $StringUtil.toCamel(NAME),
        CLASS_CAMEL_NAME =
            CAMEL_NAME.charAt(0).toUpperCase() + CAMEL_NAME.slice(1),
        PROTO_FILE = util.format(
            PROTO_TEMPLATE,
            PROJECT_NAME,
            CLASS_CAMEL_NAME,
            UNDERSCORE_NAME,
            CLASS_CAMEL_NAME
        ),
        MODEL_FILE = util.format(
            MODEL_TEMPLATE,
            DASH_NAME,
            $DateUtil.format('mm/dd/yy'),
            CLASS_CAMEL_NAME,
            UNDERSCORE_NAME
        ),
        TABLE_FILE = util.format(TABLE_TEMPLATE, UNDERSCORE_NAME),
        PROTO_DIR = `${process.cwd()}/proto`,
        MODEL_DIR = `${process.cwd()}/src/models`,
        PROTO_NAME = `${DASH_NAME}.proto`,
        MODEL_NAME = `${DASH_NAME}.model.js`,
        PROTO_FILENAME = `${PROTO_DIR}/${PROTO_NAME}`,
        MODEL_FILENAME = `${MODEL_DIR}/${MODEL_NAME}`;
    let statProto = false,
        statModel = false;

    try {
        fs.mkDirSync(PROTO_DIR);
    } catch(e) {}

    // See if the proto or model files already exist
    try {
        fs.statSync(PROTO_FILENAME);
        statProto = true;
        $LogProvider.info(`Proto for model ${cyan(NAME)} already exists`);
    } catch(e) {}

    try {
        fs.statSync(MODEL_FILENAME);
        statModel = true;
        $LogProvider.info(`Model for model ${cyan(NAME)} already exists`);
    } catch(e) {}

    try {
        if (!statProto) {
            fs.writeFileSync(PROTO_FILENAME, PROTO_FILE);
        }
    } catch(e) {
        $LogProvider.error(e);
    }

    try {
        if (!statModel) {
            fs.writeFileSync(MODEL_FILENAME, MODEL_FILE);
        }
    } catch(e) {
        $LogProvider.error(e);
    }

    $LogProvider.info(`Successfully created ${NAME} model files`);
    $LogProvider.info(
        `Attempting to create table in database ${cyan(DATABASE.database.name)}`
    );

    DATABASE.$$run(null, `CREATE SCHEMA ${DATABASE.database.name}`)
        .then(function() {
            return DATABASE.$$run(null, TABLE_FILE);
        }).then(function() {
            $LogProvider.info(
                `Angie Model ${cyan(NAME)}created and ready to use!`
            );
            process.exit(0);
        }).catch(function(e) {
            $LogProvider.error(e);
            process.exit(1);
        });
}