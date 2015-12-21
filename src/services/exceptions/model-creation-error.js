/**
 * @module model-creation-error.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/02/2015
 */

// System Modules
import $LogProvider from    'angie-log';

/**
 * @desc Thrown when a name cannot be resolved on Model creation through the CLI
 * @since 1.0.0
 * @access private
 */
class $$ModelCreationError {

    /**
     * @since 1.0.0
     * @access private
     */
    constructor() {
        const msg = 'Could not create a model without a name';

        $LogProvider.error(msg);
        throw new SyntaxError(msg);
    }
}

export default $$ModelCreationError;