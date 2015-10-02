// Test Modules
import { expect } from      'chai';

// Angie Modules
const BaseDBConnection =    require(`../../../${global.TEST_ENV}/databases/BaseDBConnection`).default;

describe('BaseDBConnection', function() {
    let base;
    beforeEach(function() {
        base = new BaseDBConnection({});
    });
    describe('$$filterQuery', function() {
        it('test query arguments in IGNORE_KEYS are actually ignored', function() {
            expect(base.$$filterQuery({
                database: 'test'
            })).to.eq('');
        });
        it('test "~" like operator', function() {
            expect(base.$$filterQuery({
                test: '~test'
            })).to.eq('test like \'%test%\'');
        });
        it('test equality on plain condition', function() {
            expect(base.$$filterQuery({
                test: 'test'
            })).to.eq('test=\'test\'');
        });
        describe('test conditions in query', function() {
            it('test non-numeric conditions in query', function() {
                expect(base.$$filterQuery({
                    test: '>test'
                })).to.eq('test>\'test\'');
            });
            it('test numeric conditions in query', function() {
                expect(base.$$filterQuery({
                    test: '>1'
                })).to.eq('test>1');
            });
            it('test non-numeric compound conditions in query', function() {
                expect(base.$$filterQuery({
                    test: '<=test'
                })).to.eq('test<=\'test\'');
            });
            it('test numeric compound conditions in query', function() {
                expect(base.$$filterQuery({
                    test: '<=1'
                })).to.eq('test<=1');
            });
            it('test curious compound conditions in query', function() {
                expect(base.$$filterQuery({
                    test: '==1'
                })).to.eq('test=\'1\'');
                expect(base.$$filterQuery({
                    test: '>>1'
                })).to.eq('test=\'1\'');
                expect(base.$$filterQuery({
                    test: '<<1'
                })).to.eq('test=\'1\'');
            });
        });
        it('test compound query arguments', function() {
            expect(base.$$filterQuery({
                test: '<1',
                test2: '2'
            })).to.eq('test<1 AND test2=\'2\'');
        });
        it('test "in" query arguments', function() {
            expect(base.$$filterQuery({
                test: [ 1, 2, 3 ]
            })).to.eq('test in (\'1\',\'2\',\'3\')');
        });
        it('test "in" query compound arguments', function() {
            expect(base.$$filterQuery({
                test: [ 1, 2, 3 ],
                test2: '<test'
            })).to.eq('test in (\'1\',\'2\',\'3\') AND test2<\'test\'');
        });
    });
});