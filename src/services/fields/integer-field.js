/**
 * @module integer-field.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

// Angie ORM modules
import BaseField from       './base-field';

class IntegerField extends BaseField {
    constructor() {
        super(...arguments);
        this.type = 'IntegerField';
    }
    validate(v) {
        return v % 1 === 0 && super.validate(v);
    }
}

export default IntegerField;