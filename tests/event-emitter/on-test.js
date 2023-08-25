import { describe } from '../../mod.js';
import { createFake } from '../utils.js';


describe('EventEmitter:on()', ({ describe }) => {
    describe('adding a single listener and firing several events', ({ before, it }) => {
        before(() => {
            const listener = createFake();

            return listener;
        });

        it('is not smoking', (subject) => {
            console.log('>>> SUBJECT:', subject);
        });
    });
});
