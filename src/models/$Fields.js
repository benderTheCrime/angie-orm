/**
 * @module $Fields.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// System Modules
import util from                'util';
import {magenta, cyan} from     'chalk';
import $LogProvider from        'angie-log';

const p = process;

class BaseField {
    constructor(
        args = 0,
        maxValue = undefined,
        minLength = 0,
        maxLength = undefined,
        nullable = false,
        unique = false,
        $default = undefined
    ) {
        this.type = 'BaseField';
        if (typeof args === 'object') {
            util._extend(this, arguments[0]);
        } else if (!isNaN(args)) {
            if (args === 1) {
                return;
            }
            [
                this.minValue,
                this.maxValue,
                this.minLength,
                this.maxLength,
                this.nullable,
                this.unique,
                this.default
            ] = [
                args,
                maxValue,
                minLength,
                maxLength,
                nullable,
                unique,
                $default
            ];
        }
    }
    create() {

        // TODO this method is not responsible for migrating a model, only
        // creating a field in a record when the model is instantiated
        if (this.default) {
            if (this.validate(this.default)) {
                this.value = typeof this.default === 'function' ? this.default() :
                    this.default;
            } else {
                throw new $$InvalidFieldConfigError(
                    this.type,
                    'Invalid default value'
                );
            }
        }
    }
    validate(value) {

        // TODO is this necessary?
        // value = value || this.value;
        if (!value && !this.nullable) {
            return false;
        }
        if (
            typeof value === 'string' &&
            (
                (
                    this.minLength &&
                    value.length < this.minLength
                ) ||
                (
                    this.maxLength &&
                    value.length > this.maxLength
                )
            )
        ) {
            return false;
        } else if (
            (
                this.minValue &&
                value < this.minValue
            ) ||
            (
                this.maxValue &&
                value > this.maxValue
            )
        ) {
            return false;
        }
        return true;
    }
}

class CharField extends BaseField {
    constructor() {
        super(...arguments);
        this.type = 'CharField';
    }
    create() {
        super.create();
        if (!this.value) {
            this.value = '';
        }
    }
    validate(value) {
        value = this.value || value;
        if (typeof value !== 'string') {
            return false;
        }
        return super.validate(value);
    }
}

class IntegerField extends BaseField {
    constructor() {
        super(...arguments);
        this.type = 'IntegerField';
    }
}

class KeyField extends IntegerField {
    constructor() {
        super(1);
        this.type = 'KeyField';
        this.unique = false;
        this.minValue = 1;
        this.maxLength = 11;
        this.nullable = false;
    }
}

class ForeignKeyField extends KeyField {
    constructor(rel, args) {
        super(args);

        this.type = 'ForeignKeyField';

        if (!rel || !global.app.Models[ rel ]) {
            throw new $$InvalidFieldConfigError(
                this.type,
                `Invalid relative model ${rel ? `${cyan(rel)} ` : ''}` +
                'in constrained field declaration'
            );
        }

        this.nesting = this.deepNesting = false;
        if (args && typeof args === 'object') {

            if (args.hasOwnProperty('deepNesting')) {
                this.nesting = this.deepNesting = true;
            } else {
                this.nesting = args.hasOwnProperty('nesting');
            }
        }
        this.rel = rel;
        this.type = 'ForeignKeyField';
    }
}

class ManyToManyField extends ForeignKeyField {
    constructor(rel, args = {}) {
        super(rel, args);

        this.type = 'ManyToManyField';
        this.unique = false;

        this.name = args.alias || args.name;
        if (!this.name) {
            throw new $$InvalidFieldConfigError(
                this.type,
                `${cyan(`${this.type}s`)} require name to be included in ` +
                'configuration and to be valid model'
            );
        }

        // Setup a reference to the relationship model
        this.crossReferenceTableId = args.tableName || `${this.name}_${this.rel}_id`;
        if (!args.crossReferenceTable) {
            global.app.Model(this.crossReferenceTableId, {
                [ `${this.name}_id` ]: new KeyField(),
                [ `${this.rel}_id` ]: new KeyField()
            });
            this.crossReferenceTable = global.app.Models[
                this.crossReferenceTableId
            ];
        } else {
            this.crossReferenceTableId = args.crossReferenceTableId;
            this.crossReferenceTable = args.crossReferenceTable;
        }
    }
}

class $$InvalidFieldConfigError extends TypeError {
    constructor(type, error = '') {
        $LogProvider.error(
            `Invalid Field configuration for ${magenta(type)}` +
            `${error ? `: ${error}` : ''}`
        );
        super();
        p.exit(1);
    }
}

export {
    CharField,
    IntegerField,
    ForeignKeyField,
    ManyToManyField
};