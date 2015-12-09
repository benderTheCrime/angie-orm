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
    $$InvalidModelFieldReferenceError
} from                                  '../services/exceptions';
import DBObjectUtil from                '../util/util/db-object-util';

// Keys we do not necessarily want to parse as query arguments
const OPERATOR_REGEXP = /^((<|>)=?)[^><]+$/g;

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
    all(args = {}, fetchQuery = '') {
        const MODEL = args.model;

        if (!(MODEL && MODEL.name)) {
            throw new $$InvalidModelReferenceError();
        }

        return `SELECT * FROM ${MODEL.name} WHERE deleted = 0${
            fetchQuery ? ` ${fetchQuery}` : ''
        }`;
    }
    fetch(args = {}, filterQuery = '') {
        const ORD = `${
            (args.head && args.head === false) ||
            (args.tail && args.tail === true) ? 'DE' : 'A'
        }SC`;

        const int = args.rows || args.count,
              fetchQuery = `ORDER BY id ${ORD}${int ? ` LIMIT ${int}` : ''}`;
        return this.all(args, fetchQuery);
    }
    filter(args = { results: null }) {
        return (
            args.results ? Promise.resolve(args.results) : this.fetch(args)
                .then(q => q.results)
        ).then(results => {
            if (results.length) {
                for (let key in args) {
                    let value = args[ key ];

                    if (DBObjectUtil.IGNORE_KEYS.indexOf(key) > -1) {
                        continue;
                    } else if (value && value.indexOf('~') > -1) {
                        results = results.filter(v => v[ key ].indexOf(
                            value.replace('~', '')
                        ) > - 1);
                    } else if (OPERATOR_REGEXP.test(value)) {

                        // TODO check types
                        const PLAIN_VALUE = value.replace(OPERATOR_REGEXP, '');
                        switch (value.match(OPERATOR_REGEXP)[ 0 ]) {
                            case '>=':
                                results = results.filter(
                                    v => v[ key ] >= PLAIN_VALUE
                                );
                                break;
                            case '<=':
                                results = results.filter(
                                    v => v[ key ] <= PLAIN_VALUE
                                );
                                break;
                            case '>':
                                results = results.filter(
                                    v => v[ key ] > PLAIN_VALUE
                                );
                                break;
                            case '<':
                                results = results.filter(
                                    v => v[ key ] < PLAIN_VALUE
                                );
                        }
                    } else {
                        results = results.filter(v => v[ key ] === value);
                    }
                }
            }

            return (this || args.model).$$queryset(
                (args.model || this), args.query, results, []
            );
        });
    }
    create(args = {}) {
        const MODEL = args.model;
        let protoObjectValue,
            protoSerializedObjectValue;

        if (!(MODEL && MODEL.name)) {
            throw new $$InvalidModelReferenceError();
        }

        // Check that the key actually exists on the model and that it is of
        // valid type
        DBObjectUtil.validateInsertedDBObject(MODEL, args);

        protoObjectValue = new MODEL.$$Proto(args);
        protoSerializedObjectValue =
            MODEL.$$Proto.encode(protoObjectValue).toBinary();

        return `INSERT INTO ${MODEL.name} (data) VALUES ("${
            protoSerializedObjectValue
        }");`;
    }

    $$queryset(model = {}, query, rows = [], errors) {
        const queryset = new DBObjectUtil(this, model, query);
        let results = [];

        if (rows instanceof Array) {
            rows.forEach(function(v) {
                const ROW = util._extend({}, v);

                // Add update method to row to allow the single row to be
                // updated
                v.update = queryset.update.bind(queryset, ROW);
                v.delete = queryset.delete.bind(queryset, ROW);

                // Create a copy to be added to the raw results set
                results.push(ROW);
            });
        }

        // Add update method to row set so that the whole queryset can be
        // updated
        // TODO use extend?
        rows.update = queryset.update.bind(queryset, results);
        rows.delete = queryset.delete.bind(queryset, results);

        return util._extend(
            rows,
            {

                // The raw query results
                results: results,

                // Any errors
                errors: errors,
                first: DBObjectUtil.first,
                last: DBObjectUtil.last,
                filter: DBObjectUtil.filter.bind(null, model, results)
            }
        );
    }
}

export default BaseDBConnection;