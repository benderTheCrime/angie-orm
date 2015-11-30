/**
 * @module decorators.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/23/2015
 */

function Base(name) {
    return obj => { global.app[ name ](obj.prototype.constructor.name, obj); };
}

const Model = Base('Model');
export { Model };