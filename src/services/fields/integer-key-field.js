/**
 * @module key-field.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

// Angie ORM modules
import KeyField from       './key-field';

class IntegerKeyField extends KeyField {
    constructor() {
        super();
        this.type = 'IntegerKeyField';
        this.minValue = 1;
        this.maxLength = 11;
    }
}

export default KeyField;