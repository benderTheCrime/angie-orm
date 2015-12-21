/**
 * @module migration-creation-error.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/02/2015
 */

 // System Modules
 import { cyan } from                'chalk';
 import $LogProvider from            'angie-log';

const REASONS = [
    null,
    'Invalid Migration Name'
];

 /**
  * @desc Thrown when there is an issue with the way a migration is created
  * @since 1.0.0
  * @access private
  */
 class $$MigrationCreationError {

     /**
      * @since 1.0.0
      * @access private
      */
     constructor(i) {
         const msg = `Error creating migration: ${REASONS[ i ]}`;

         $LogProvider.error(msg);
         throw new TypeError(msg);
     }
 }

 export default $$MigrationCreationError;