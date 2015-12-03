/**
 * @module base-connection.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// System Modules
import util from                        'util';
import { cyan } from                    'chalk';
import $LogProvider from                'angie-log';

// Angie ORM Modules
import {
    $$InvalidModelReferenceError,
    $$InvalidModelFieldReferenceError,
    $$InvalidRelationCrossReferenceError
} from                                  '../util/$ExceptionsProvider';

// Keys we do not necessarily want to parse as query arguments
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

/**
 * @desc BaseDBConnection is a private class which is not exposed to the Angie
 * provider. It contains all of the methods quintessential to making DB queries
 * regardless of DB vehicle. Some of the methods in this class are specific to
 * SQL type DBs and will need to be replaced when subclassed. This should be the
 * base class used for each DB type
 * @since 0.2.3
 * @access private
 */
class BaseDBConnection {

    /**
     * @param {object} database The database object to which the connection is
     * being made
     */
    constructor(database) {
        this.database = database;
    }
    models() {
        return this._models;
    }
    all(args = {}, fetchQuery = '', filterQuery = '') {
        const MODEL = args.model;

        if (!(MODEL && MODEL.name)) {
            throw new $$InvalidModelReferenceError();
        }

        // let values = '*';
        // if (typeof args.values === 'object' && args.values.length) {
        //     values = args.values;
        //     if (values.indexOf('id') === -1) {
        //         values.unshift('id');
        //     }
        // }

        return `SELECT * FROM ${MODEL.name}` +
            `${filterQuery ? ` WHERE ${filterQuery}` : ''}` +
            `${fetchQuery ? ` ${fetchQuery}` : ''};`;
    }
    fetch(args = {}, filterQuery = '') {
        let ord = `${
            (args.head && args.head === false) ||
            (args.tail && args.tail === true) ? 'DE' : 'A'
        }SC`;

        const int = args.rows,
              fetchQuery = `ORDER BY id ${ord}${int ? ` LIMIT ${int}` : ''}`;
        return this.all(args, fetchQuery, filterQuery);
    }
    filter(args = {}) {
        return this.fetch(args, this.$$filterQuery(args));
    }

    /**
     * @desc _fitlerQuery builds the "WHERE" statements of queries. It is
     * responsible for parsing all query conditions
     * @since 0.2.2
     * @param {object} args Object representation of the arguments
     * @param {string} args.key Name and value/conditions of field to be parsed.
     * Values can be prefixed with the following comparators:
     *     "~": "Like", >, >=, <, <=
     * @param {object|Array<>} args.values Fields for an "in" query
     * @returns {string} A query string to be passed to the performed query
     * @access private
     */
    $$filterQuery(args) {
        let filterQuery = [],
            fn = function(k, v) {

                // If we're dealing with a number...
                if (typeof v === 'number') {
                    return `${k}=${v}`;
                } else if (v.indexOf('~') > -1) {

                    // If there is a like operator, add a like phrase
                    return `${k} like '%${v.replace(/~/g, '')}%'`;
                } else if (
                    /(<=?|>=?)[^<>=]+/.test(v) &&
                    v.indexOf('>>') === -1 &&
                    v.indexOf('<<') === -1
                ) {

                    // If there is a condition, parse it, use as operator
                    // ^^ TODO there has to be a better way to do that condition
                    return v.replace(/(<=?|>=?)([^<>=]+)/, function(m, p, v) {
                        return `${k}${p}${!isNaN(v) ? v : `'${v}'` }`;
                    });
                }

                // Otherwise, return equality
                return `${k}='${v.replace(/[<>=]*/g, '')}'`;
            };
        for (let key in args) {
            if (IGNORE_KEYS.indexOf(key) > -1) {
                continue;
            }
            if (args[ key ] && typeof args[ key ] !== 'object') {
                filterQuery.push(fn(key, args[ key ]));
            } else {
                filterQuery.push(`${key} in ${this.$$queryInString(args[ key ])}`);
            }
        }
        return filterQuery.length ? `${filterQuery.join(' AND ')}` : '';
    }
    create(args = {}) {
        const MODEL = args.model;
        let keys = Object.keys(args),
            protoSerializedObjectValue;

        if (!(MODEL && MODEL.name)) {
            throw new $$InvalidModelReferenceError();
        }

        keys.forEach(k => {
            if (IGNORE_KEYS.includes(k)) {
                delete args[ k ];
            }
        });

        console.log('ARGS', args);

        // try {
            protoSerializedObjectValue = MODEL.$$serialize(args);
        // } catch(e) {
        //    console.log('ERROR', e);

            // TODO you've got to handle this really well
            // TODO create error
        //    throw e;
        // }

        console.log('PROTO', protoSerializedObjectValue);
        return `INSERT INTO ${MODEL.name} (data) VALUES ("${
            protoSerializedObjectValue
        }");`;
    }

    // TODO delete does not delete
    delete(args = {}) {
        // return `DELETE FROM ${args.model.name} WHERE ${this.$$filterQuery(args)};`;
    }
    update(args = {}) {
        if (!args.model || !args.model.name) {
            throw new $$InvalidModelReferenceError();
        }

        let filterQuery = this.$$filterQuery(args),
            idSet = this.$$queryInString(args.rows, 'id');
        if (!filterQuery) {
            $LogProvider.warn('No filter query in UPDATE statement.');
        } else {
            return `UPDATE ${args.model.name} SET ${filterQuery} WHERE id in ${idSet};`;
        }
    }

    /**
     * @desc $$queryInString builds any "in" query statements in the query
     * arguments
     * @since 0.2.2
     * @param {object} args Object representation of the arguments
     * @param {string} args.key Name and value/conditions of field to be parsed
     * @param {object|Array<>} args.values Fields for an "in" query
     * @param {string} key The name of the key to parse for "in" arguments
     * @returns {string} A query string to be passed to the performed query
     * @access private
     */
    // TODO move this to another class
    $$queryInString(args = {}, key) {
        let fieldSet = [];
        if (key) {
            args.forEach(function(row) {
                fieldSet.push(`'${row[ key ]}'`);
            });
        } else if (args instanceof Array) {
            fieldSet = args.map((v) => `'${v}'`);
        }
        return `(${fieldSet.length ? fieldSet.join(',') : ''})`;
    }
    // sync() {
    //     let me = this;
    //
    //     // Every instance of sync needs a registry of the models, which implies
    //     return global.app.$$load().then(function() {
    //         me._models = global.app.Models;
    //         $LogProvider.info(
    //             `Synccing database: ${
    //                 cyan(me.database.name || me.database.alias)
    //             }`
    //         );
    //     });
    // }
    // migrate() {
    //     let me = this;
    //
    //     // Every instance of sync needs a registry of the models, which implies
    //     return global.app.$$load().then(function() {
    //         me._models = global.app.Models;
    //         $LogProvider.info(
    //             `Migrating database: ${
    //                 cyan(me.database.name || me.database.alias)
    //             }`
    //         );
    //     });
    // }
    $$queryset(model = {}, query, rows = [], errors) {
        console.log('ARGS', arguments);
        const queryset = new AngieDBObject(this, model, query);
        let results = [];
            // manyToManyFieldNames = [],
            // rels = [],
            // relFieldNames = {},
            // relArgs = {},
            // proms = [];

        // for (let key in model) {
        //     let field = model[ key ];
        //     if (field.type && field.type === 'ManyToManyField') {
        //         manyToManyFieldNames.push(key);
        //     }
        // }

        try {

        if (rows instanceof Array) {

            // TODO you've got to handle this parsing better
            rows.map(v => v.data ? model.$$parse(v.data) : null).forEach(v => {

                // Create a copy to be added to the raw results set
                let $v = util._extend({}, v);

                // Add update method to row to allow the single row to be
                // updated
                v.update = queryset.$$update.bind(queryset, v);

                // for (let key of manyToManyFieldNames) {
                //     const field = model[ key ],
                //           many = v[ key ] = {};
                //     for (let method of [ 'add', 'remove' ]) {
                //         many[ method ] =
                //             queryset.$$addOrRemove.bind(
                //                 queryset,
                //                 method,
                //                 field,
                //                 v.id
                //             );
                //     }
                //     for (let method of [ 'all', 'fetch', 'filter' ]) {
                //         many[ method ] = queryset.$$readMethods.bind(
                //             queryset,
                //             method,
                //             field,
                //             v.id
                //         );
                //     }
                // }

                // Find all of the foreign key fields
                // for (let key in v) {
                //     const field = model[ key ];
                //     if (field && (
                //             field.nesting === true ||
                //             field.deepNesting === true
                //         )
                //     ) {
                //         rels.push(field.rel);
                //         relFieldNames[ field.rel ] = key;
                //         relArgs[ field.rel ] = rows.map((v) => v.id);
                //     }
                // }

                results.push($v);
            });
        }

    } catch(e) { console.log(e); }

        // Add update method to row set so that the whole queryset can be
        // updated
        rows.update = queryset.$$update.bind(queryset, rows);

        // Remove reference methods
        delete queryset.$$update;
        delete queryset.$$addOrRemove;
        delete queryset.$$readMethods;

        // Instantiate a promise for each of the foreign key fields in the query
        // rels.forEach(function(v) {
        //
        //     // Reference the relative object
        //     proms.push(global.app.Models[ v ].filter({
        //         database: model.$$database.name,
        //         id: relArgs[ v ]
        //     }).then(function(queryset) {
        //
        //         // Add errors to queryset errors
        //         if (errors === null) {
        //             errors = [];
        //         }
        //
        //         // Add any errors to the queryset
        //         errors.push(queryset.errors);
        //
        //         rows.forEach(function(row, i) {
        //             queryset.forEach(function(queryrow) {
        //                 if (
        //                     !isNaN(+row[ relFieldNames[ v ] ]) &&
        //                     queryrow.hasOwnProperty('id') &&
        //                     row[ relFieldNames[ v ] ] === queryrow.id
        //                 ) {
        //
        //                     // Assign the nested row
        //                     results[ i ][ relFieldNames[ v ] ] =
        //                         queryset.results[ i ];
        //                     row[ relFieldNames[ v ] ] = queryrow;
        //                 } else {
        //                     results[ i ][ relFieldNames[ v ] ] =
        //                         row[ relFieldNames[ v ] ] = null;
        //                 }
        //             });
        //         });
        //     }));
        // });

        // return Promise.all(proms).then(function() {

            // Resolves to a value in the connections currently
            return util._extend(
                rows,
                {

                    // The raw query results
                    results: results,

                    // Any errors
                    errors: errors,

                    first: AngieDBObject.prototype.first,
                    last: AngieDBObject.prototype.last
                },
                queryset
            );
        // });
    }

    // $$name(modelName) {
    //     modelName = modelName.replace(/([A-Z])/g, '_$1').toLowerCase();
    //     if (modelName.charAt(0) === '_') {
    //         modelName = modelName.slice(1, modelName.length);
    //     }
    //     return modelName;
    // }
}

// TODO move this to another class
class AngieDBObject {
    constructor(database, model, query = '') {
        if (!database || !model) {
            return;
        }
        this.database = database;
        this.model = model;
        this.query = query;
    }
    first() {
        return this[0];
    }
    last() {
        return this.pop();
    }
    $$update(rows, args = {}) {

        // This should only be called internally, so it's not a huge hack:
        // rows either references the whole queryset or just a single row
        args.rows = rows instanceof Array ? rows : [ rows ];
        args.model = this.model;

        if (typeof args !== 'object') {
            return;
        }

        let updateObj = {};
        for (let key in args) {
            const val = args[ key ] || null;
            if (IGNORE_KEYS.indexOf(key) > -1) {
                continue;
            } else if (
                this.model[ key ] &&
                this.model[ key ].validate &&
                this.model[ key ].validate(val)
            ) {
                updateObj[ key ] = val;
            } else {
                throw new $$InvalidModelFieldReferenceError(this.model.name, key);
            }
        }

        util._extend(args, updateObj);
        return this.database.update(args);
    }
    $$addOrRemove(method, field, id, obj = {}, extra = {}) {
        switch (method) {
            case 'add':
                method = '$createUnlessExists';
                break;
            default: // 'remove'
                method = 'delete';
        }

        // Get database, other extra options
        obj = util._extend(obj, extra);

        // Check to see that there is an existing related object
        return global.app.Models[ field.rel ].exists(obj).then(function(v) {

            // Check to see if a reference already exists <->
            if (v) {
                let $obj = util._extend({
                    [ `${field.name}_id`]: id,
                    [ `${field.rel}_id` ]: obj.id
                }, extra);
                return field.crossReferenceTable[ method ]($obj);
            }
            throw new Error();
        }).catch(function() {
            throw new $$InvalidRelationCrossReferenceError(method, field, id, obj);
        });
    }
    $$readMethods(method, field, id, args = {}) {
        args = util._extend(args, {
            [ `${field.name}_id` ]: id,
            values: [ `${field.rel}_id` ]
        });
        method = [ 'filter', 'fetch' ].indexOf(method) > -1 ? method : 'filter';
        return field.crossReferenceTable[ method ](args);
    }
}

// TODO move this to exceptions
class $$DatabaseConnectivityError extends Error {
    constructor(database) {
        let message;
        switch (database.type) {
            case 'mysql':
                message = 'Could not find MySql database ' +
                    `${cyan(database.name || database.alias)}@` +
                    `${database.host || '127.0.0.1'}:${database.port || 3306}`;
                break;
            default:
                message = `Could not find ${cyan(database.name)} in filesystem.`;
        }
        $LogProvider.error(message);
        super();
        process.exit(1);
    }
}

export default BaseDBConnection;
export { $$DatabaseConnectivityError };
