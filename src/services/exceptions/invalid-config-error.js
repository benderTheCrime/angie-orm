/**
 * @module invaild-config-error.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/01/2015
 */

// System Modules
import { cyan } from                'chalk';
import $LogProvider from            'angie-log';

/**
 * @desc Thrown when there is an issue with the AngieFile.json configuration
 * @since 0.4.0
 * @access private
 */
class $$InvalidConfigError {

    /**
     * @since 0.4.0
     * @access private
     */
    constructor(name = '') {
        const msg = `Invalid${name ? ` ${cyan(name)}` : ''} configuration. ` +
            'Please check your AngieFile.';

        $LogProvider.error(msg);
        throw new ReferenceError(msg);
    }
}

export default $$InvalidConfigError;