/**
 * @module Angie.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// System Modules
import util from                                'util';
import Protobuf from                            'protobufjs';
import { blue } from                            'chalk';
import $LogProvider from                        'angie-log';

// Angie ORM Modules
import BaseModel from                           './models/BaseModel';
import * as $$FieldProvider from                './models/$Fields';
import { $$InvalidModelConfigError } from       './util/$ExceptionsProvider';


// Setup the app or inherit the app from the `global` Namespace
let app = global.app;

app.Model = app.model = function Model(name, Obj = {}) {

    // Instantiate the Model class here
    let model = typeof Obj === 'function' ?
        new Obj($$FieldProvider) :
            typeof Obj === 'object' ? Obj : undefined;
    model.name = model.name || name;

    // We need to try and load the associated proto!
    const builder = Protobuf.loadProtoFile(
        `${__dirname}/proto/${model.name}.proto`
    );

    console.log('MODEL PROTO', builder);
    let instance = new BaseModel();



    // Mock extend obj onto the instance
    if (typeof model === 'object') {
        instance = util._extend(instance, model);
    } else {
        throw new $$InvalidModelConfigError(name);
    }

    this.$$register('Models', model.name, instance);

    return this;
};

app.services.$Fields = $$FieldProvider;
app.$$registry.$Fields = 'services';
app.Models = {};