/**
 * @module AngieDatabaseRouter.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// System Modules
import fs from                          'fs';

// Angie ORM Modules
import MySqlConnection from             './MySqlConnection';
import {
    $$InvalidConfigError,
    $$InvalidDatabaseConfigError
} from                                  '../util/$ExceptionsProvider';

const p = process;
let app,
    dbs = {},
    config;

function AngieDatabaseRouter(args) {
    app = app || global.app;

    let database,
        name = 'default';

    if (!config && !global.app.$$config) {
        let $$config;

        try {
            $$config = JSON.parse(
                fs.readFileSync(`${p.cwd()}/AngieORMFile.json`)
            );
        } catch(e) {}

        if (!$$config) {
            try {
                $$config = JSON.parse(
                    fs.readFileSync(`${p.cwd()}/AngieFile.json`)
                );
            } catch(e) {
                throw new $$InvalidConfigError();
            }
        }

        if (typeof $$config === 'object') {
            app.$$config = $$config;
            Object.freeze(app.$$config);
        } else {
            throw new $$InvalidConfigError();
        }
    }
    config = global.app.$$config;

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
                config.databases.default : null,
        destructive = p.argv.some(v => /--destructive/i.test(v)),
        dryRun = p.argv.some(v => /--dry([-_])?run/i.test(v));

    if (db && db.type) {
        switch (db.type.toLowerCase()) {

            // TODO you have to sys require these
            case 'mysql':
                database = new MySqlConnection(name, db, destructive, dryRun);
                break;
            case 'mongodb':
                database = new MongoDBConnection(db, destructive, dryRun);
                break;
            case 'firebase':
                database = new FirebaseConnection(db, destructive, dryRun);
                break;
            default:
                database = new SqliteConnection(db, destructive, dryRun);
        }
    }

    if (!database) {
        throw new $$InvalidDatabaseConfigError();
    }

    // Setup a cache of database connections in memory already
    dbs[ name ] = database;
    return database;
}

export default AngieDatabaseRouter;
