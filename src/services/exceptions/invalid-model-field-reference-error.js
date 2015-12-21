/**
 * @module invaild-model-field-reference-error.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

// System Modules
import { cyan } from                'chalk';
import $LogProvider from            'angie-log';

/**
 * @desc Thrown when a field is invalid or cannot be found for a model
 * @since 1.0.0
 * @access private
 */
class $$InvalidModelFieldReferenceError {

    /**
     * @since 1.0.0
     * @access private
     */
    constructor(name = '', field) {
        const msg = `Invalid param for Model ${cyan(name)}.${cyan(field)}`;

        $LogProvider.error(msg);
        throw new ReferenceError(msg);
    }
}

export default $$InvalidModelFieldReferenceError;