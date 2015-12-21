/**
 * @module decorators.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

const BASE = m => o => app[ m ](o.prototype.constructor.name, o),
    Model = BASE('Model');
export { Model };