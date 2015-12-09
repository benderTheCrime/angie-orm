/**
 * @module invaild-model-reference-error.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

// System Modules
import $LogProvider from            'angie-log';

/**
 * @desc Thrown when a called model cannot be found
 * @since 1.0.0
 * @access private
 */
class $$InvalidModelReferenceError {

    /**
     * @since 1.0.0
     * @access private
     */
    constructor(name) {
        const msg = 'Invalid Model argument';

        $LogProvider.error(msg);
        throw new ReferenceError(msg);
    }
}

export default $$InvalidModelReferenceError;