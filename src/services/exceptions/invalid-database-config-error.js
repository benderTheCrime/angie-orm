/**
 * @module invaild-database-config-error.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/01/2015
 */

import $$InvalidConfigError from    './invaild-config-error';

class $$InvalidDatabaseConfigError extends $$InvalidConfigError {
    constructor() {
        super('database');
    }
}

export default $$InvalidDatabaseConfigError;