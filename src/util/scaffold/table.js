/**
 * @module table.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// System Modules
import fs from                          'fs';
import util from                        'util';
import { argv } from                    'yargs';
import { cyan } from                    'chalk';
import $Injector from                   'angie-injector';
import $LogProvider from                'angie-log';

// Project Modules
import { default as router } from       '../../databases/router';
import { $$ModelCreationError } from    '../../services/exceptions';
import { $DateUtil } from               '../util';

// TODO the model scaffold has to create files for:
//      - the Angie model itself
//      - the .proto scaffold

console.log(process.cwd());

const $StringUtil = $Injector.get('$StringUtil'),
    TEMPLATE_PREFIX = `${__dirname}/../../templates/template.`,
    ENCODING = 'utf8',
    PROTO_TEMPLATE = fs.readFileSync(`${TEMPLATE_PREFIX}proto.txt`, ENCODING),
    MODEL_TEMPLATE = fs.readFileSync(`${TEMPLATE_PREFIX}model.js.txt`, ENCODING);

export default function() {

    // If the user did this correctly, there is a name
    // TODO camel and underscore this name
    const NAME = argv._.length > 3 ? argv._[ 3 ] : argv._[ 2 ],
        DATABASE_NAME = argv._.length > 3 ?
            argv._[ 2 ] : argv.d || argv.database || 'default';

    if (!NAME) {
        throw $$ModelCreationError();
    }

    // TODO error if name does not exist
    const DATABASE = router(DATABASE_NAME),
        DASH_NAME = $StringUtil.toDash(NAME),
        UNDERSCORE_NAME = $StringUtil.toUnderscore(NAME),
        CAMEL_NAME = $StringUtil.toCamel(NAME),

        // TODO I don't know what to do with this yet
        PROTO_FILE = PROTO_TEMPLATE,
        MODEL_FILE = util.format(
            MODEL_TEMPLATE,
            DASH_NAME,

            // TODO fix dates
            $DateUtil.format('mm/dd/yy'),
            CAMEL_NAME.charAt(0).toUpperCase() + CAMEL_NAME.slice(1),
            UNDERSCORE_NAME
        ),
        PROTO_DIR = `${process.cwd()}/proto`,
        MODEL_DIR = `${process.cwd()}/src/models`,
        PROTO_NAME = `${DASH_NAME}.proto`,
        MODEL_NAME = `${DASH_NAME}.model.js`,
        PROTO_FILENAME = `${PROTO_DIR}/${PROTO_NAME}`,
        MODEL_FILENAME = `${MODEL_DIR}/${MODEL_NAME}`;
    let statProto = false,
        statModel = false;

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
        console.log(PROTO_FILENAME, DASH_NAME);
        if (!statProto) {
            fs.writeFileSync(PROTO_FILENAME, PROTO_FILE);
        }
    } catch(e) {
        if (e.code === 'ENOENT') {
            $LogProvider.warn(`Could not find directory ${cyan(PROTO_DIR)}`);
            $LogProvider.warn(
                `Writing ${cyan(PROTO_NAME)} to current directory`
            );
            fs.writeFileSync(PROTO_NAME, PROTO_FILE);
        } else {
            $LogProvider.error(e);
        }
    }

    try {
        if (!statModel) {
            fs.writeFileSync(MODEL_FILENAME, MODEL_FILE);
        }
    } catch(e) {
        if (e.code === 'ENOENT') {
            $LogProvider.warn(`Could not find directory ${cyan(MODEL_DIR)}`);
            $LogProvider.warn(
                `Writing ${cyan(MODEL_NAME)} to current directory`
            );
            fs.writeFileSync(MODEL_NAME, MODEL_FILE);
        } else {
            $LogProvider.error(e);
        }
    }

    $LogProvider.info(`Successfully created model files for model ${NAME}`);
    $LogProvider.info('Attempting to scaffold model in database');

    try {
        console.log(DATABASE);
    } catch(e) {}

    // TODO if DB does not exist create it, or try to
    // TODO if Table does not exist, create it, or try to
        // TODO just one field (for now) called "data"
}