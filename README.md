![emblem](https://rawgit.com/angie-framework/angie-orm/master/svg/angie.svg "emblem")

## Angie ORM

[![Join the chat at https://gitter.im/benderTheCrime/angie-orm](https://badges.gitter.im/benderTheCrime/angie-orm.svg)](https://gitter.im/benderTheCrime/angie-orm?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![npm version](https://badge.fury.io/js/angie-orm.svg)](http://badge.fury.io/js/angie-orm "npm version")
![iojs support](https://img.shields.io/badge/iojs-1.7.1+-brightgreen.svg "iojs support")
![node support](https://img.shields.io/badge/node-0.12.0+-brightgreen.svg "node support")
![npm downloads](https://img.shields.io/npm/dm/angie-orm.svg "npm downloads")
![build status](https://travis-ci.org/benderTheCrime/angie-orm.svg?branch=master "build status")
![code coverage](https://rawgit.com/benderTheCrime/angie-orm/master/svg/coverage.svg "code coverage")
[![documentation](https://doc.esdoc.org/github.com/angie-framework/angie-orm/badge.svg)](https://doc.esdoc.org/github.com/angie-framework/angie-orm/ "documentation")

[![NPM](https://nodei.co/npm/angie-orm.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/angie-orm/)

### About
Angie ORM is a feature-complete database relationship manager designed for NodeJS.

#### Current Database Support
* MySQL via the [node-mysql](https://github.com/felixge/node-mysql "node-mysql") package
* sqlite3 via the [node-sqlite3](https://github.com/mapbox/node-sqlite3 "node-sqlite3") package

#### Planned Database Support
* Firebase
* MongoDB
* Couchbase
* Postgres

### Usage
```bash
npm i -g angie-orm
angie-orm help
```
Building databases is easy! In a file called `AngieORMFile.json`:
```json
{
    "databases": {
        "default": {
            "type": "sqlite3",
            "name": "angie.db"
        },
        "test_site": {
            "type": "mysql",
            "alias": "angie_site",
            "username": "root"
        }
    }
}
```
You can make models in several ways
```javascript
global.app.Model('test', function($Fields) {
    let obj = {};
    obj.test = new $Fields.CharField({
        default: () => 'test ' + 'test'
    });
    obj.many = new $Fields.ManyToManyField('test2', {
        name: 'test'
    });
    return obj;
});

@Model
class test {
    constructor($Fields) {
        this.test = new $Fields.CharField({
            default: () => 'test ' + 'test'
        });
        this.many = new $Fields.ManyToManyField('test2', {
            name: 'test'
        });
    }
}
```
These two models are functionally equivalent. To actually build your databases:
```bash
angie-orm syncdb [name]
```
Where if no name is specified, the default database will be synced. This will also automatically migrate your database, but a command for migrating databases is also available:
```bash
angie-orm syncdb [name] [--destructive]
```
Where destructive will force stale tables and columns to be deleted. All of the above is done for you in your `AngieFile.json` if you are building an Angie application.

The first argument provided the function passed to the model will be $Fields, an object containing all of the available field types. Individual fields can also be required from their source in `angie-orm/src/models/$Fields`:
```javascript
import {CharField} from 'angie-orm/src/models/$Fields';

// or

require('angie-orm/src/models/$Fields').CharField;
```
Available Field Types Include:
* `CharField`
* `IntegerField`
* `KeyField`
* `ForeignKeyField`
* `ManyToManyField`

Additionally, Fields can be passed configuration options on instantiation:
* `minValue`
* `maxValue`
* `minLength`
* `maxLength`
* `nullable`
* `unique`
* `default`

In that order as arguments or in an Object. Foreign key and many to many fields require as a first argument a related table with which a reference is made. Additionally, these fields support `nesting` and `deepNesting` options. Many to many fields require a name be passed as reference.

If you have a need for a Field type that is not included, feel free to make a Pull Request (and follow the current format), or ask.

All queries return a Promise with a queryset
```javascript
global.app.Models.test.all().then(function(queryset) {
    return queryset[1].update({
        test: 'test'
    }).then(function() {
        process.exit(0);
    });
});
```
querysets are extended Arrays, which include an index list of records with extended methods, a list of unmodified results (`queryset.results`), and methods

Model methods include:
* `all`: Fetch all of the rows associated with a Models
* `fetch`: Fetch a certain number of rows
* `filter`: Filter a queryset. Supports conditionals.
* `create`: Create a record
* `delete`: Delete a record
* `update`: Update a record
* `exists`: Does the `filter` query return any results (passes a boolean to the resolve)

All supports no arguments. The other READ methods on the tables support an Object as an argument with the following keys:
* values: The list of fields you would like to see
* ord: Order 'ASC' or 'DESC'
* int: The number of rows you would like to have returned
* each key in the table, with a WHERE value (eg: `id>1` would be `{ id: '>1' }`)

Create/Update queries require all non nullable fields to have a value in the arguments object or an error will be thrown. All queries support the `database` argument, which will specify the database that is hit for results.

Update queries are available on the entire queryset as well as each row. Additionally, methods to retrieve the `first` and `last` row in the returned records are available. Many to many fields have the added functionality of fetching `all` related rows, `fetch`ing, `filtering` related rows, and `add`ing, and `removing` related rows. The arguments to these methods must be existing related database objects.

For a list of Frequently Asked Questions, please see the [FAQ](https://github.com/benderTheCrime/angie-orm/blob/master/FAQ.md "FAQ") and the [CHANGELOG](https://github.com/benderTheCrime/angie-orm/blob/master/CHANGELOG.md "CHANGELOG") for an up to date list of changes. Contributors to this Project are outlined in the [CONTRIBUTORS](https://github.com/benderTheCrime/angie-orm/blob/master/CONTRIBUTORS.md "CONTRIBUTORS") file.

### Angie
Please see the [site](http://benderthecrime.github.io/angie/) for information about the project, a quickstart guide, and documentation and the [CHANGELOG](https://github.com/benderTheCrime/angie/blob/master/CHANGELOG.md) for an up to date list of changes.