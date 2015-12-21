/**
 * @module angie.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// System Modules
import util from                                'util';
import Protobuf from                            'protobufjs';
import { blue } from                            'chalk';
import $Injector from                           'angie-injector';
import $LogProvider from                        'angie-log';

// Angie ORM Modules
import BaseModel from                           './models/base-model';
import * as $Fields from                        './services/fields';
import {
    $$InvalidConfigError,
    $$InvalidModelConfigError,
    $$MissingProtoError
} from                                          './services/exceptions';


// Setup the app or inherit the app from the `global` Namespace
let app = global.app;

app.services.$Fields = $Fields;
app.$$registry.$Fields = 'services';
app = util._extend(app, {
    Model,
    model: Model,
    Models: {}
});

function Model(name, Obj = {}) {

    // Instantiate the Model class here
    const PROJECT_NAME = app.$$config.projectName,
        MODEL = typeof Obj === 'function' ?
            new Obj($$FieldProvider) :
                typeof Obj === 'object' ? Obj : undefined;

    if (!MODEL.name) {
        if (name) {
            MODEL.name = name;
        } else {
            throw new $$InvalidModelConfigError('Unknown');
        }
    }

    let projectName = MODEL.name === 'angie_migrations' ?
        'AngieORM' : app.$$config.projectName;

    if (!projectName) {
        throw new $$InvalidConfigError('projectName');
    }

    // We need to try and load the associated proto!
    const $StringUtil = $Injector.get('$StringUtil'),
        CLASS_CAMEL_NAME = $StringUtil.toClassCase(MODEL.name),
        BUILDER = Protobuf.loadProtoFile(
            MODEL.protoFilename || `${process.cwd()}/proto/${MODEL.name}.proto`
        ),
        SCHEMA = BUILDER.build(projectName),
        PROTO = SCHEMA[ CLASS_CAMEL_NAME ][ CLASS_CAMEL_NAME ];
    let instance;

    if (PROTO) {
        instance = new BaseModel(PROTO);
    } else {
        throw new $$MissingProtoError(MODEL.name)
    }

    // Mock extend obj onto the instance
    if (typeof MODEL === 'object') {
        instance = util._extend(instance, MODEL);
    } else {
        throw new $$InvalidModelConfigError(MODEL.name);
    }

    return this.$$register('Models', CLASS_CAMEL_NAME, instance);
};