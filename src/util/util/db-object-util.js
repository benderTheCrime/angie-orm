/**
 * @module db-object-util.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

// System Modules
import util from                                'util';

// Angie ORM Modules
import $$InvalidModelFieldReferenceError from   '../../services/exceptions/invalid-model-field-reference-error';

class DBObjectUtil {
    constructor(database, model, query = '') {
        this.database = database;
        this.model = model;
        this.query = query;
    }
    update(rows, args = {}) {
        rows = rows instanceof Array ? rows : [ rows ];
        args.database = this.database;

        let me = this;

        /**
         * Check that the key actually exists on the model and that it is of
         * valid type
         */
        DBObjectUtil.validateInsertedDBObject(this.model, args);

        return this.delete(rows).then(function() {
            let proms = [];

            return Promise.all(rows.map(
                v => me.model.create(util._extend(v, args))
            )).then(function(querysets) {
                const ROWS = Array.prototype.concat
                    .apply([], querysets.map(v => v.results));
                return me.database.$$queryset(me.model, args.query, ROWS, []);
            });
        });
    }
    delete(rows = []) {
        rows = rows instanceof Array ? rows : [ rows ];

        const IDS = rows.map(v => v.id).join(','),
            QUERY = `UPDATE ${
                this.model.name
            } SET \`deleted\` = 1 WHERE \`id\` in (${IDS});`
        return this.database.$$run(this.model, QUERY);
    }
    static validateInsertedDBObject(model, args = {}) {
        Object.keys(args).forEach(k => {
            const VALUE = args[ k ];

            if (this.IGNORE_KEYS.includes(k)) {
                delete args[ k ];
            } else if (
                !(model[ k ] && model[ k ].type && model[ k ].validate(VALUE))
            ) {
                throw new $$InvalidModelFieldReferenceError(model.name, k);
            }
        });
    }
    static filter(model, results, args = {}) {
        return model.filter(util._extend({ model, results }, args));
    }
    static first() {
        return this.length ? this[ 0 ] : null;
    }
    static last() {
        return this.length ? this.slice(-1)[ 0 ] : null;
    }

}

DBObjectUtil.IGNORE_KEYS = [
    '$$database',
    'created',
    'database',
    'fields',
    'first',
    'head',
    'id',
    'keys',
    'last',
    'model',
    'name',
    'query',
    'results',
    'rows',
    'tail',
    'update',
    'values'
];

export default DBObjectUtil;