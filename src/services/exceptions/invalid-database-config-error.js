/**
 * @module invaild-database-config-error.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/01/2015
 */

import $$InvalidConfigError from    './invalid-config-error';

/**
 * @desc Thrown when there is an issue with the AngieFile.json configuration
 * specific to databases
 * @since 1.0.0
 * @access private
 */
class $$InvalidDatabaseConfigError extends $$InvalidConfigError {

    /**
     * @since 1.0.0
     * @access private
     */
    constructor() {
        super('database');
    }
}

export default $$InvalidDatabaseConfigError;