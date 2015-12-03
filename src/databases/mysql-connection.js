/**
 * @module mysql-connection.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// System Modules
import mysql from                               'mysql';
import {
    cyan,
    magenta,
    gray
} from                                          'chalk';
import $LogProvider from                        'angie-log';

// Angie ORM Modules
import BaseDBConnection from                    './base-connection';
import { $$InvalidDatabaseConfigError } from    '../util/$ExceptionsProvider';

const MYSQL_INFO = $LogProvider.info.bind(null, 'MySQL'),
    DEFAULT_HOST = '127.0.0.1',
    DEFAULT_PORT = 3306;

class MySqlConnection extends BaseDBConnection {
    constructor(name, database) {
        super(database);
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

    // TODO we no longer need to resolve the type of field
    // types(model, key) {
    //     const field = model[ key ];
    //     let type = field.type,
    //         maxLength = '';
    //     if (!type) {
    //         return;
    //     }
    //     if (field.maxLength) {
    //         maxLength = `(${field.maxLength})`;
    //     }
    //     switch (type) {
    //         case 'CharField':
    //             return `VARCHAR${maxLength}`;
    //
    //         // TODO support different size integers: TINY, SMALL, MEDIUM
    //         case 'IntegerField':
    //             return `INTEGER${maxLength}`;
    //         case 'KeyField':
    //             return `INTEGER${maxLength}`;
    //         case 'ForeignKeyField':
    //             return `INTEGER${maxLength}, ADD CONSTRAINT fk_${key} ` +
    //                 `FOREIGN KEY(${key}) REFERENCES ${field.rel}(id) ON ` +
    //                 `DELETE CASCADE`;
    //         default:
    //             return undefined;
    //     }
    // }

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
                        MYSQL_INFO('Connection successful');
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
                MYSQL_INFO(`Query: ${cyan(name)}: ${magenta(query)}`);
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

    // TODO I don't think we need this
    // raw(query, model) {
    //     return this.run(query, model);
    // }
}

export default MySqlConnection;