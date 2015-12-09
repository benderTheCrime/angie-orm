/**
 * @module char-field.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

// Angie ORM modules
import BaseField from       './base-field';

class CharField extends BaseField {
    constructor() {
        super(...arguments);
        this.type = 'CharField';
    }
    validate(value) {
        value = this.value || value;
        if (typeof value !== 'string') {
            return false;
        }
        return super.validate(value);
    }
}

export default CharField;