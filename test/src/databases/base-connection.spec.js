// Test Modules
import { expect } from      'chai';

// Angie Modules
const TEST_ENV =            global.TEST_ENV || 'src',
    BaseDBConnection =      require(`../../../${TEST_ENV}/databases/base-connection`).default;

describe('BaseDBConnection', function() {});