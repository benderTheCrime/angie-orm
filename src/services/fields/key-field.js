/**
 * @module key-field.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

// Angie ORM modules
import IntegerField from       './integer-field';

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

export default KeyField;