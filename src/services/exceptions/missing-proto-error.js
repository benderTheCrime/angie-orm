/**
 * @module missing-proto-error.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/02/2015
 */

 // System Modules
 import { cyan } from                'chalk';
 import $LogProvider from            'angie-log';

/**
 * @desc Thrown when the ORM fails to find the proto file associated with a
 * model
 * @since 1.0.0
 * @access private
 */
class $$MissingProtoError {

    /**
     * @since 1.0.0
     * @access private
     */
    constructor(name) {
        const msg = `Could not find proto file ${cyan(name)}`;

        $LogProvider.error(msg);
        throw new ReferenceError(msg);
    }
}

export default $$MissingProtoError;