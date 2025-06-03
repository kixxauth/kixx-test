import { KixxAssert } from '../../dev-dependencies.js';
import EventEmitter from '../../lib/event-emitter.js';
import { describe } from '../../mod.js';
import { createFake } from '../utils.js';


const { assertEqual } = KixxAssert;


// eslint-disable-next-line no-shadow
describe('EventEmitter:on()', ({ describe }) => {
    describe('when adding a single listener for an event', ({ before, it }) => {
        const ev1 = {};
        const ev2 = {};

        before(() => {
            const listener = createFake();
            const emitter = new EventEmitter();

            emitter.on('foo', listener);

            emitter.emit('foo', ev1);
            emitter.emit('bar', ev1);
            emitter.emit('foo', ev2);

            return listener;
        });

        it('is called expected number of times', (listener) => {
            assertEqual(2, listener.callCount);
        });

        it('is called with expected event objects', (listener) => {
            let call;

            call = listener.getCall(0);
            assertEqual(1, call.args.length);
            assertEqual(ev1, call.args[0]);

            call = listener.getCall(1);
            assertEqual(1, call.args.length);
            assertEqual(ev2, call.args[0]);
        });
    });

    describe('when adding the same listener to the same event');
});
