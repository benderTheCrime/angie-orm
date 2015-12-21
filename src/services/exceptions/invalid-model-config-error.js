/**
 * @module invaild-model-config-error.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

// System Modules
import { cyan } from                'chalk';
import $LogProvider from            'angie-log';

/**
 * @desc Thrown when there is an issue with the way a model is set up
 * @since 1.0.0
 * @access private
 */
class $$InvalidModelConfigError {

    /**
     * @since 1.0.0
     * @access private
     */
    constructor(name) {
        const msg = `Invalid Model configuration for model ${cyan(name)}`;

        $LogProvider.error(msg);
        throw new TypeError(msg);
    }
}

export default $$InvalidModelConfigError;