/**
 * @module mysql-connection.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// System Modules
import util from                                'util';
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

    // TODO Does this even matter
    disconnect() {
        this.connection.end();
        this.connected = false;
    }
    run(model, query) {
        let me = this,
            name = this.name;
        return this.connect().then(function() {
            return new Promise(function(resolve) {
                MYSQL_INFO(`Query: ${cyan(name)}: ${magenta(query)}`);
                return me.connection.query(query, function(e, rows = []) {
                    if (e) {
                        $LogProvider.warn(e);
                    }

                    if (typeof rows.map !== 'function') {
                        rows = [];
                    }

                    // TODO does this belong here?
                    resolve([ rows.map(v => util._extend({
                        id: v.id, created: v.created
                    }, model.$$parse(v.data))), e ]);
                });
            });
        }).then(function(args) {
            return me.$$queryset(model, query, ...args);
        });
    }
    all() {
        const MODEL = arguments[ 0 ].model,
            QUERY = super.all.apply(this, arguments);
        return this.run(MODEL, QUERY);
    }
    create() {
        const MODEL = arguments[ 0 ].model,
            QUERY = super.create.apply(this, arguments);
        return this.run(MODEL, QUERY);
    }
    delete() {
        const MODEL = arguments[ 0 ].model,
            QUERY = super.delete.apply(this, arguments);
        return this.run(MODEL, QUERY);
    }
}

export default MySqlConnection;