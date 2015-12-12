/**
 * @module migration.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

// TODO pull migration model out
// TODO load here and in migrations
// TODO work with next active migrations first

// Global Modules
import                                          'babel-core';

// System Modules
import { argv } from                            'yargs';
import { $injectionBinder } from                'angie-injector';
import $LogProvider from                        'angie-log';

// Angie ORM Modules
import { $$MigrationInvocationError } from      '../../services/exceptions';

function migrateAll() {
    return getInactiveMigrations().then(function(queryset) {
        return Promise.all(queryset.map(v => migrate(null, v)));
    }).then(function() {
        $LogProvider.info(`Successfully ran all inactive migrations`);
        process.exit(0);
    }).catch(function(e) {
        $LogProvider.error(e);
        process.exit(1);
    });
}

function migrate(number, migration) {
    let calledFromAllMigrations = true,
        filename,
        file;

    number = +number || argv._[ 2 ] || argv.n || argv.number;

    const PADDED_NUMBER = number < 10 ? `00${number}` : number < 100 ?
        `0${number}` : number;

    if (!migration) {
        calledFromAllMigrations = false;

        if (number) {
            migration = getInactiveMigrations()
                .then(q => q.filter({ uuid: PADDED_NUMBER }))
                .then(q => q.first());
        } else {
            throw new $$MigrationInvocationError(1);
        }
    } else {
        migration = Promise.resolve(migration);
    }

    return migration.then(function(migration) {
        let prom;

        if (!migration) {
            throw new $$MigrationInvocationError(3);
        }

        try {
            filename = migration.filename;
            file = require(`${process.cwd()}/migrations/${filename}`);
        } catch(e) {
            throw new $$MigrationInvocationError(2);
        }

        prom = $injectionBinder(file)();

        if (prom instanceof Promise) {
            return prom.then(function() {
                return migration;
            });
        } else {
            return migration;
        }
    }).then(function(migration) {
        return migration.update({
            database: argv.d || argv.database,
            active: true
        });
    }).then(function() {
        $LogProvider.info(`Successfully migrated ${filename}`);

        if (calledFromAllMigrations === false) {
            process.exit(0);
        }
    }).catch(function(e) {
        $LogProvider.error(e);
        process.exit(1);
    });
}

function getInactiveMigrations() {
    return app.Models.AngieMigrations.filter({ active: false });
}

export {
    migrateAll as $$migrateAll,
    migrate as $$migrate
};