/**
 * @module base-field.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

// System Modules
import util from                'util';

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
    validate(value) {
        if (value === null && !this.nullable) {
            return false;
        }
        if (
            typeof value === 'string' &&
            (
                (this.minLength && value.length < this.minLength) ||
                (this.maxLength && value.length > this.maxLength)
            )
        ) {
            return false;
        } else if (
            (this.minValue && value < this.minValue) ||
            (this.maxValue && value > this.maxValue)
        ) {
            return false;
        }
        return true;
    }
}

export default BaseField;