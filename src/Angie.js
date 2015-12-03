/**
 * @module Angie.js
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
import BaseModel from                           './models/BaseModel';
import * as $$FieldProvider from                './models/$Fields';
import { $$InvalidModelConfigError } from       './util/$ExceptionsProvider';
import {
    $$InvalidConfigError,
    $$MissingProtoError
} from                                          './services/exceptions';


// Setup the app or inherit the app from the `global` Namespace
let app = global.app;

app.Model = app.model = function Model(name, Obj = {}) {

    // Instantiate the Model class here
    const PROJECT_NAME = app.$$config.projectName,
        MODEL = typeof Obj === 'function' ?
            new Obj($$FieldProvider) :
                typeof Obj === 'object' ? Obj : undefined;

    if (!PROJECT_NAME) {
        throw new $$InvalidConfigError('projectName');
    }

    if (!MODEL.name) {
        if (name) {
            MODEL.name = name;
        } else {
            throw new $$InvalidModelConfigError('Unknown');
        }
    }

    // We need to try and load the associated proto!
    const $StringUtil = $Injector.get('$StringUtil'),
        CLASS_CAMEL_NAME = $StringUtil.toClassCase(MODEL.name),
        BUILDER = Protobuf.loadProtoFile(
            MODEL.protoFilename || `${process.cwd()}/proto/${MODEL.name}.proto`
        ),
        SCHEMA = BUILDER.build(app.$$config.projectName),
        PROTO = SCHEMA[ CLASS_CAMEL_NAME ][ CLASS_CAMEL_NAME ];
    let instance;

    if (PROTO) {
        instance = new BaseModel(PROTO);
    } else {
        throw new $$MissingProtoError(MODEL.name)
    }

    console.log('MODEL PROTO', PROTO);

    // Mock extend obj onto the instance
    if (typeof MODEL === 'object') {
        instance = util._extend(instance, MODEL);
    } else {
        throw new $$InvalidModelConfigError(MODEL.name);
    }

    return this.$$register('Models', MODEL.name, instance);
};

app.services.$Fields = $$FieldProvider;
app.$$registry.$Fields = 'services';
app.Models = {};