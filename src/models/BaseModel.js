/**
 * @module BaseModel.js
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
} from                                  '../util/$ExceptionsProvider';

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

// TODO this has to serialize on behalf of MySQL
// TODO you can't fetch ids
// TODO you can't filter out values
// TODO you cant update, only delete and create
// TODO filter implies selecting all and then manually checking the results
class BaseModel {
    constructor(proto) {
        this.$$Proto = proto;
    }
    all(args = {}) {

        // Returns all of the rows
        return this.$$prep
            .apply(this, util._extend({ model: this }, arguments))
            .all(args);
    }
    fetch(args = {}) {
        let me = this;

        // Returns a subset of rows specified with an int and a head/tail
        // argument
        return this.$$prep
            .apply(this, util._extend({ model: this }, arguments))
            .all(args).then(function(queryset) {
                return queryset;
            });
    }
    filter(args = {}) {

        // Returns a filtered subset of rows
        return this.$$prep
            .apply(this, util._extend({ model: this }, arguments))
            .filter(args);
    }
    create(args = {}) {
        return this.$$prep
            .apply(this, util._extend({ model: this }, arguments))
            .create(args);
    }

    // TODO delete can't be called without calling a model first, need the id
    // delete(args = {}) {
    //     args.model = this;
    //
    //     // Delete a record/set of records
    //     return this.$$prep.apply(this, arguments).delete(args);
    // }
    exists(args = {}) {
        args.model = args.model || this;
        return this.filter
            .apply(this, arguments)
            .then(queryset => !!queryset[ 0 ]);
    }

    // TODO this is an ill-advised intensive operation
    $createUnlessExists(args = {}) {
        args.model = this;

        // Check to see if a matching record exists and if not create it
        let me = this;
        return this.exists(args).then(v => me[ v ? 'fetch' : 'create' ](args));
    }

    $$prep(args = {}) {
        const database = typeof args === 'object' &&
            args.hasOwnProperty('database') ? args.database : null;

        // This forces the router to use a specific database, DB can also be
        // forced at a model level by using this.database
        this.$$database = router(
            database || this.database || 'default'
        );

        return this.$$database;
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