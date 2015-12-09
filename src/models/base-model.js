/**
 * @module base-model.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// System Modules
import util from                        'util';
import { cyan } from                    'chalk';
import $LogProvider from                'angie-log';

// Angie Modules
import router from                      '../databases/router';
import {
    $$InvalidModelFieldReferenceError
} from                                  '../services/exceptions';

const IGNORE_KEYS = [
    'database',
    '$$database',
    'model',
    'name',
    'fields',
    'tail',
    'head',
    'rows',
    'update',
    'first',
    'last',
    'values'
];

// TODO you can't fetch ids
// TODO you can't filter out values
// TODO you cant update, only delete and create
// TODO filter implies selecting all and then manually checking the results
class BaseModel {
    constructor(proto) {
        this.$$Proto = proto;
    }
    all(args = {}) {
        args = util._extend({ model: this }, args);
        return this.$$prep.apply(this, args).all(args);
    }
    fetch(args = {}) {
        args = util._extend({ model: this }, args);
        return this.$$prep.apply(this, args).fetch(args);
    }
    find(count = 1) {
        const ARGS = util._extend({
            model: this
        }, { count: parseInt(count) || 1 });
        return this.$$prep.apply(this, ARGS).fetch(ARGS);
    }
    filter(args = {}) {
        args = util._extend({ model: this }, args);
        return this.$$prep.apply(this, args).filter(args);
    }
    create(args = {}) {
        args = util._extend({ model: this }, args);
        return this.$$prep.apply(this, args).create(args);
    }
    exists(args = {}) {
        return this.filter
            .apply(this, util._extend({ model: this }, args))
            .then(queryset => !!queryset[ 0 ]);
    }

    // TODO this is an ill-advised intensive operation
    $createUnlessExists(args = {}) {
        args = util._extend({ model: this }, args);

        // Check to see if a matching record exists and if not create it
        return this.exists
            .apply(this, args)
            .then(v => this[ v ? 'fetch' : 'create' ](args));
    }

    $$prep(args = {}) {
        const database = typeof args === 'object' &&
            args.hasOwnProperty('database') ? args.database : null;

        // This forces the router to use a specific database, DB can also be
        // forced at a model level by using this.database in the model
        return this.$$database = router(database || 'default');
    }
    $$serialize(obj) {
        return this.$$Proto.encode(obj);
    }
    $$parse(obj) {

        // TODO buffer
        try {
            return this.$$Proto.decode(obj);
        } catch(e) {
            if (e.decoded) {
                return e.decoded;
            } else {
                throw e;
            }
        }

    }
}

export default BaseModel;