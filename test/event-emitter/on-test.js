import sinon from 'sinon';
import { assert, assertEqual } from 'kixx-assert';
import { describe } from '../../mod.js';
import EventEmitter from '../../lib/event-emitter.js';
import { assertThrows } from '../helpers.js';


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

    it('throws an error if eventName is not a string', () => {
        const emitter = new EventEmitter();
        const handler = sinon.spy();

        assertThrows(() => emitter.on(null, handler), 'Event name must be a string');
        assertThrows(() => emitter.on(undefined, handler), 'Event name must be a string');
        assertThrows(() => emitter.on(123, handler), 'Event name must be a string');
        assertThrows(() => emitter.on({}, handler), 'Event name must be a string');
        assertThrows(() => emitter.on([], handler), 'Event name must be a string');
    });

    it('throws an error if handler is not a function', () => {
        const emitter = new EventEmitter();

        assertThrows(() => emitter.on('test', null), 'Handler must be a function');
        assertThrows(() => emitter.on('test', undefined), 'Handler must be a function');
        assertThrows(() => emitter.on('test', 'not a function'), 'Handler must be a function');
        assertThrows(() => emitter.on('test', 123), 'Handler must be a function');
        assertThrows(() => emitter.on('test', {}), 'Handler must be a function');
        assertThrows(() => emitter.on('test', []), 'Handler must be a function');
    });
});
