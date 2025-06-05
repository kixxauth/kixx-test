import { describe } from 'kixx-test';
import { assertEqual } from 'kixx-assert';


// eslint-disable-next-line no-shadow
describe('Disabled Tests Example', ({ it, xit, describe, xdescribe }) => {
    it('this test will run', () => {
        assertEqual(true, true);
    });

    xit('this test will be skipped', () => {
        // This test will not run
        assertEqual(true, false);
    });

    describe('Disabled Block', ({ it }) => { // eslint-disable-line no-shadow
        it('this test will not run because parent is disabled', () => {
            // This test will not run
            assertEqual(true, false);
        });
    }, { disabled: true });

    xdescribe('Disabled Describe Block', ({ it }) => { // eslint-disable-line no-shadow
        it('this test will not run', () => {
            // This test will not run
            assertEqual(true, false);
        });

        it('this test will also not run', () => {
            // This test will not run
            assertEqual(true, false);
        });
    });

    describe('Mixed Block', ({ it, xit }) => { // eslint-disable-line no-shadow
        it('this test will run', () => {
            assertEqual(true, true);
        });

        xit('this test will be skipped', () => {
            // This test will not run
            assertEqual(true, false);
        });

        it('this test will also run', () => {
            assertEqual(true, true);
        });
    });
});
