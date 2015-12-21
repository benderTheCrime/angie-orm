/**
 * @module float-field.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

// Angie ORM modules
import BaseField from       './base-field';

class FloatField extends BaseField {
    constructor() {
        super(...arguments);
        this.type = 'FloatField';
    }
    validate(v) {
        return !isNaN(v) && n % 1 !== 0 && super.validate(v);
    }
}

export default FloatField;