/**
 * @module $ExceptionsProvider.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

// System Modules
import { magenta, cyan } from       'chalk';
import $LogProvider from            'angie-log';

class $$InvalidModelConfigError extends TypeError {
    constructor(name, error = '') {
        $LogProvider.error(
            'Invalid Model configuration for model ' +
            `${magenta(name)} <-- ${magenta(name)}${magenta('Provider')}` +
            `${error ? ` ${error}` : ''}`
        );
        super();
    }
}

class $$InvalidModelReferenceError extends Error {
    constructor() {
        $LogProvider.error('Invalid Model argument');
        super();
    }
}

class $$InvalidModelFieldReferenceError extends Error {
    constructor(name = '', field) {
        $LogProvider.error(
            `Invalid param for Model ${cyan(name)}.${cyan(field)}`
        );
        super();
    }
}

export {
    $$InvalidModelConfigError,
    $$InvalidModelReferenceError,
    $$InvalidModelFieldReferenceError
};