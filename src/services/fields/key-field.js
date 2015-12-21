/**
 * @module key-field.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

// Angie ORM modules
import BaseField from       './base-field';

class KeyField extends BaseField {
    constructor() {
        super(1);
        this.type = 'KeyField';
        this.unique = true;
        this.nullable = false;
    }
}

export default KeyField;