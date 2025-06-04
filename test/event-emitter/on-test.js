import sinon from 'sinon';
import { assert, assertEqual } from 'kixx-assert';
import { describe } from '../../mod.js';
import EventEmitter from '../../lib/event-emitter.js';


describe('EventEmitter#on()', ({ it }) => {

    it('calls multiple handlers in the order they were registered', () => {
        const emitter = new EventEmitter();
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        emitter.on('test', spy1);
        emitter.on('test', spy2);
        emitter.emit('test', { test: 'test' });
        assertEqual(1, spy1.callCount);
        assertEqual(1, spy2.callCount);
        assert(spy1.calledBefore(spy2));
    });

    it('calls multiple handlers with the same event object', () => {
        const emitter = new EventEmitter();
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        const eventObj = { test: 'test' };

        emitter.on('test', spy1);
        emitter.on('test', spy2);
        emitter.emit('test', eventObj);

        assertEqual(1, spy1.callCount);
        assertEqual(1, spy2.callCount);
        assertEqual(eventObj, spy1.firstCall.args[0]);
        assertEqual(eventObj, spy2.firstCall.args[0]);
    });

    it('calls the same handler multiple times for each registration', () => {
        const emitter = new EventEmitter();
        const spy = sinon.spy();
        const eventObj = { test: 'test' };
        emitter.on('test', spy);
        emitter.on('test', spy);
        emitter.emit('test', eventObj);
        assertEqual(2, spy.callCount);
        assertEqual(eventObj, spy.firstCall.args[0]);
        assertEqual(eventObj, spy.secondCall.args[0]);
    });
});
