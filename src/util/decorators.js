/**
 * @module decorators.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

const app = global.app;

function base(m) {
    return o => app[ m ](o.prototype.constructor.name, o);
}

const Model = base('Model');
export { Model };