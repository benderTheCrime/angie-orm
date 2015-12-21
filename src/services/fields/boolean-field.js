/**
 * @module boolean-field.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/10/2015
 */

// Angie ORM modules
import BaseField from       './base-field';

class BooleanField extends BaseField {
    constructor() {
        super(...arguments);
        this.type = 'BooleanField';
    }
    validate(value) {
        return (value === true || value === false) && super.validate(value);
    }
}

export default BooleanField;