/**
 * @module exceptions.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/01/2015
 */

// Angie Modules
import $$InvalidConfigError from            './exceptions/invalid-config-error';
import $$InvalidDatabaseConfigError from    './exceptions/invalid-database-config-error';
import $$MissingProtoError from             './exceptions/missing-proto-error';
import $$ModelCreationError from            './exceptions/model-creation-error';

export {
    $$InvalidConfigError,
    $$InvalidDatabaseConfigError,
    $$ModelCreationError
};