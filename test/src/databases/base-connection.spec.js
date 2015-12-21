// Test Modules
import { expect } from      'chai';

// Angie Modules
const TEST_ENV =            global.TEST_ENV || 'src',
    BaseDBConnection =      require(`../../../${TEST_ENV}/databases/base-connection`);

describe('BaseDBConnection', function() {
    it('test constructor', function() {
        expect(new BaseDBConnection({
            test: 'test'
        })).to.deep.eq({ database: { test: 'test' }});
    });
});