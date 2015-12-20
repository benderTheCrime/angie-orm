/**
 * @module db-object-generator-util.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/08/2015
 */

import DBObjectUtil from    './db-object-util';

DBObjectUtil.yield = function* (results) {
    for (let result of results) {
        yield result;
    }
};

export default DBObjectUtil;