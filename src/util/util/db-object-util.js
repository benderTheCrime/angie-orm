/**
 * @module db-object-util.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

 // Angie ORM Modules
 import {
     $$InvalidModelFieldReferenceError
 } from                                  '../../services/exceptions';

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

        // Check that the key actually exists on the model and that it is of
        // valid type
        validateInsertedDBObject(this.model, args);

        return this.delete(rows).then(function() {
            let proms = [];

            return Promise.all(rows.map(v => me.model.create(util._extend(v, args))))
                .then(function(querysets) {
                    const ROWS = Array.prototype.concat
                        .apply([], querysets.map(v => v.results));

                    // TODO map all of the newly created rows
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

            console.log(k , model[ k ]);
            console.log(VALUE);

            if (this.IGNORE_KEYS.includes(k)) {
                delete args[ k ];
            } else if (
                !(model[ k ] && model[ k ].type && model[ k ].validate(VALUE))
            ) {
                console.log('k', k, model[ k ], model[ k ].type, model[ k ].validate(VALUE));
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
    'values',
    'id',
    'created',
    'query',
    'results'
];

export default DBObjectUtil;