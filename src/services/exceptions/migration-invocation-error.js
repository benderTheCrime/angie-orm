/**
 * @module migration-invocation-error.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/12/2015
 */

 // System Modules
 import { cyan } from                'chalk';
 import $LogProvider from            'angie-log';

const REASONS = [
    null,
    [ 'Invalid Migration Number', TypeError ],
    [ 'Could not find migration file', ReferenceError ],
    [ 'Migration already active or does not exist', ReferenceError ]
];

 /**
  * @desc Thrown when there is an issue with the way a migration is run
  * @since 1.0.0
  * @access private
  */
 class $$MigrationInvocationError {

     /**
      * @since 1.0.0
      * @access private
      */
     constructor(i) {
         const MSG = `Error running migration: ${REASONS[ i ][ 0 ]}`;

         $LogProvider.error(MSG);
         throw new REASONS[ i ][ 1 ](MSG);
     }
 }

 export default $$MigrationInvocationError;