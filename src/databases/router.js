/**
 * @module router.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// System Modules
import fs from                          'fs';

// Angie ORM Modules
import MySqlConnection from             './mysql-connection';
import {
    $$InvalidConfigError,
    $$InvalidDatabaseConfigError
} from                                  '../util/$ExceptionsProvider';

const p = process;
let app = global.app,
    dbs = {},
    config = global.app.$$config;

export default function(args) {
    let database,
        name = 'default';

    if (args instanceof Array) {
        for (let arg of args) {
            if (Object.keys(config.databases).indexOf(arg) > -1) {
                name = arg;
                break;
            }
        }
    } else if (typeof args === 'string') {
        name = args;
    }

    // Check to see if the database is in memory
    database = dbs[ name ];
    if (database) {
        return database;
    }

    // Try to fetch database by name or try to grab default
    let db = config.databases && config.databases[ name ] ?
            config.databases[ name ] : config.databases.default ?
                config.databases.default : null;

    if (db && db.type) {
        switch (db.type.toLowerCase()) {
            default:
                database = new MySqlConnection(name, db);
        }
    }

    if (!database) {
        throw new $$InvalidDatabaseConfigError();
    }

    // Setup a cache of database connections in memory already
    dbs[ name ] = database;
    return database;
}