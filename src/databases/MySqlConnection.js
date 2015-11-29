/**
 * @module MySqlConnection.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// System Modules
import mysql from                       'mysql';
import {cyan, magenta, gray} from       'chalk';
import $LogProvider from                'angie-log';

// Angie Modules
import BaseDBConnection from           './BaseDBConnection';
import {
    $$InvalidDatabaseConfigError
} from                                  '../util/$ExceptionsProvider';

const p = process,
      DEFAULT_HOST = '127.0.0.1',
      DEFAULT_PORT = 3306;
$LogProvider.mysqlInfo = $LogProvider.info.bind(null, 'MySQL');

class MySqlConnection extends BaseDBConnection {
    constructor(name, database, destructive, dryRun) {
        super(database, destructive, dryRun);
        let db = this.database;

        if (!db.username) {
            throw new $$InvalidDatabaseConfigError(db);
        } else if (!this.connection) {
            this.name =this.database.name || this.database.alias || name;
            this.connection = mysql.createConnection({
                host: db.host || DEFAULT_HOST,
                port: db.port || DEFAULT_PORT,
                user: db.username || '',
                password: db.password || '',
                database: this.name
            });

            this.connection.on('error', function() {
                if (db.options && db.options.hardErrors) {
                    throw new $$InvalidDatabaseConfigError(db);
                }
            });

            this.connected = false;
        }
    }
    types(model, key) {
        const field = model[ key ];
        let type = field.type,
            maxLength = '';
        if (!type) {
            return;
        }
        if (field.maxLength) {
            maxLength = `(${field.maxLength})`;
        }
        switch (type) {
            case 'CharField':
                return `VARCHAR${maxLength}`;

            // TODO support different size integers: TINY, SMALL, MEDIUM
            case 'IntegerField':
                return `INTEGER${maxLength}`;
            case 'KeyField':
                return `INTEGER${maxLength}`;
            case 'ForeignKeyField':
                return `INTEGER${maxLength}, ADD CONSTRAINT fk_${key} FOREIGN KEY(${key}) ` +
                    `REFERENCES ${field.rel}(id) ON DELETE CASCADE`;
            default:
                return undefined;
        }
    }
    connect() {
        let me = this;
        return new Promise(function(resolve) {
            if (me.connected === false) {
                me.connection.connect(function(e) {

                    // TODO add this back in?
                    if (e) {
                        // throw new $$DatabaseConnectivityError(me.database);
                        $LogProvider.error(e);
                    } else {
                        me.connected = true;
                        $LogProvider.mysqlInfo('Connection successful');
                    }
                });
            }
            resolve();
        });
    }
    disconnect() {
        this.connection.end();
        this.connected = false;
    }
    run(query, model) {
        let me = this,
            name = this.name;
        return this.connect().then(function() {
            return new Promise(function(resolve) {
                $LogProvider.mysqlInfo(
                    `Query: ${cyan(name)}: ${magenta(query)}`
                );
                return me.connection.query(query, function(e, rows = []) {
                    if (e) {
                        $LogProvider.warn(e);
                    }
                    resolve([ rows, e ]);
                });
            });
        }).then(function(args) {
            return me.$$queryset(model, query, args[0], args[1]);
        });
    }
    all() {
        const query = super.all.apply(this, arguments);
        return this.run(query, arguments[0].model);
    }
    create() {
        const query = super.create.apply(this, arguments);
        return this.run(query, arguments[0].model);
    }
    delete() {
        const query = super.delete.apply(this, arguments);
        return this.run(query, arguments[0].model);
    }
    update() {
        const query = super.update.apply(this, arguments);
        return this.run(query, arguments[0].model);
    }
    raw(query, model) {
        return this.run(query, model);
    }
    sync() {
        let me = this;

        // Don't worry about the error state, handled by connection
        return super.sync().then(function() {
            let models = me.models(),
                proms = [];

            for (let model in models) {

                // Fetch models and get model name
                let instance = models[ model ],
                    modelName = instance.name || instance.alias ||
                        me.$$name(model);

                // Run a table creation with an ID for each table
                proms.push(me.run(
                    `CREATE TABLE \`${modelName}\` ` +
                    '(`id` int(11) NOT NULL AUTO_INCREMENT, ' +
                    'PRIMARY KEY (`id`) ' +
                    ') ENGINE=InnoDB DEFAULT CHARSET=latin1;'
                ));
            }
            return Promise.all(proms).then(function() {
                return me.migrate();
            });
        });
    }
    // migrate() {
    //     let me = this;
    //     return super.migrate().then(function() {
    //         return me.run('SHOW TABLES').then((queryset) => queryset);
    //     }).then(function(queryset) {
    //         // const modelMap = [
    //         //     for (model of queryset) model[ `Tables_in_${me.name}` ]
    //         // ];
    //         const modelMap = queryset.map((v) => v[ `Tables_in_${me.name}` ]);
    //         let models = me.models(),
    //             proms = [];
    //         for (let key of modelMap) {
    //             let prom;
    //             if (!models.hasOwnProperty(key)) {
    //
    //                 // Don't consolidate, we don't want to look at the fields
    //                 if (me.destructive) {
    //                     prom = me.run(`DROP TABLE \`${key}\`;`);
    //                 }
    //             } else {
    //                 const model = models[ key ],
    //                       modelName = me.$$name(model.name || model.alias),
    //                       fields = model.$fields();
    //                 prom = me.run(
    //                     `SHOW COLUMNS from \`${modelName}\`;`,
    //                     modelName
    //                 ).then(function(queryset) {
    //                     let proms = [];
    //                     queryset.forEach(function(v) {
    //                         if (
    //                             fields.indexOf(v.Field) === -1 &&
    //                             v.Field !== 'id' &&
    //                             me.destructive
    //                         ) {
    //                             let baseQuery = `ALTER TABLE \`${modelName}\` `,
    //                                 query =
    //                                     `${baseQuery}DROP COLUMN \`${v.Field}\`;`,
    //                                 keyQuery;
    //                             if (v.Key) {
    //                                 keyQuery =
    //                                     `${baseQuery}DROP FOREIGN KEY ` +
    //                                     `\`fk_${v.Field}\`;`;
    //                             }
    //                             if (!me.dryRun) {
    //                                 let prom;
    //                                 if (keyQuery) {
    //                                     prom = me.run(keyQuery).then(
    //                                         () => me.run(query)
    //                                     );
    //                                 } else {
    //                                     prom = me.run(query);
    //                                 }
    //                                 proms.push(prom);
    //                             } else {
    //                                 $LogProvider.mysqlInfo(
    //                                     `Dry Run Query: ${gray(`${keyQuery} ${query}`)}`
    //                                 );
    //                             }
    //                         }
    //                     });
    //
    //                     // TODO you've got to return if many to many here
    //                     fields.forEach(function(v) {
    //                         if (model[ v ].type === 'ManyToManyField') {
    //                             return;
    //                         }
    //                         if (queryset.map(($v) => $v.Field).indexOf(v) === -1) {
    //                             let query,
    //                                 $default;
    //                             if (model[ v ].default) {
    //                                 $default = model[ v ].default;
    //                                 if (typeof $default === 'function') {
    //                                     $default = $default();
    //                                 }
    //                             }
    //                             query =
    //                                 `ALTER TABLE \`${modelName}\` ADD COLUMN \`${v}\` ` +
    //                                 `${me.types(model, v)}` +
    //                                 `${model[ v ].nullable ? '' : ' NOT NULL'}` +
    //                                 `${model[ v ].unique ? ' UNIQUE' : ''}` +
    //                                 `${$default ? ` DEFAULT '${$default}'` : ''};`;
    //                             if (!me.dryRun) {
    //                                 proms.push(me.run(query));
    //                             } else {
    //                                 $LogProvider.mysqlInfo(
    //                                     `Dry Run Query: ${gray(query)}`
    //                                 );
    //                             }
    //                         }
    //                     });
    //                     return Promise.all(proms);
    //                 });
    //             }
    //             proms.push(prom);
    //         }
    //         return Promise.all(proms);
    //     }).then(function() {
    //         me.disconnect();
    //         $LogProvider.mysqlInfo(
    //             `Successfully Synced & Migrated ${cyan(me.name)}`
    //         );
    //         p.exit(0);
    //     });
    // }
}

export default MySqlConnection;