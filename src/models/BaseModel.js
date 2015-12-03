/**
 * @module BaseModel.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// System Modules
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
        this.$$proto = proto;
    }
    all(args = {}) {
        args.model = this;

        // Returns all of the rows
        return this.$$prep.apply(this, arguments).all(args);
    }
    fetch(args = {}) {
        args.model = this;

        // Returns a subset of rows specified with an int and a head/tail
        // argument
        return this.$$prep.apply(this, arguments).fetch(args);
    }
    filter(args = {}) {
        args.model = this;

        // Returns a filtered subset of rows
        return this.$$prep.apply(this, arguments).filter(args);
    }
    exists(args = {}) {
        args.model = args.model || this;
        return this.filter.apply(this, arguments).then(function(queryset) {
            return !!queryset[0];
        });
    }
    create(args = {}) {
        args.model = this;

        this.database = this.$$prep.apply(this, arguments);

        // Make sure all of our fields are resolved
        // let createObj = {},
        //     me = this;

        // TODO just let the proto do its job
        // this.$fields().forEach(function(field) {
        //     let val = args[ field ] || args.model[ field ].default || null;
        //     if (typeof val === 'function') {
        //         val = val.call(this, args);
        //     }
        //
        //     // TODO mismatched field and proto types
        //     if (
        //         me[ field ] &&
        //         me[ field ].validate &&
        //         me[ field ].validate(val)
        //     ) {
        //         createObj[ field ] = val;
        //     } else {
        //         throw new $$InvalidModelFieldReferenceError(me.name, field);
        //     }
        // });

        // Once that is settled, we can call our create
        return this.database.create(args);
    }
    $createUnlessExists(args = {}) {
        args.model = this;

        // Check to see if a matching record exists and if not create it
        let me = this;
        return this.exists(args).then(v => me[ v ? 'fetch' : 'create' ](args));
    }

    // TODO delete can't be called without calling a model first
    // delete(args = {}) {
    //     args.model = this;
    //
    //     // Delete a record/set of records
    //     return this.$$prep.apply(this, arguments).delete(args);
    // }

    // TODO I don't think you can make special queries here
    // query(query, args = {}) {
    //     if (typeof query !== 'string') {
    //         return new Promise(function() {
    //             arguments[1](new Error('Invalid Query String'));
    //         });
    //     }
    //     return this.$$prep.apply(this, args).raw(query, this);
    // }

    // $fields() {
    //     this.fields = [];
    //     for (let key in this) {
    //         if (
    //             typeof this[ key ] === 'object' &&
    //             IGNORE_KEYS.indexOf(key) === -1
    //         ) {
    //             this.fields.push(key);
    //         }
    //     }
    //     return this.fields;
    // }

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
        return this.$$proto.encode(obj).buffer;
    }
    $$parse(obj) {

        // TODO buffer
        return this.$$proto.decode(obj);
    }
}

// class $$InvalidRelationCrossReferenceError extends RangeError {
//     constructor(method, field) {
//         $LogProvider.error(
//             `Cannot ${method} reference on ${cyan(field.name)}: ` +
//             'No such existing record.'
//         );
//         super();
//     }
// }

export default BaseModel;