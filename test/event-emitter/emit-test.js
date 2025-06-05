import sinon from 'sinon';
import { assertEqual } from 'kixx-assert';
import { describe } from '../../mod.js';
import EventEmitter from '../../lib/event-emitter.js';
import { assertThrows } from '../helpers.js';

describe('EventEmitter#emit()', ({ it }) => {
    it('calls all registered handlers with the event data', () => {
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

    it('does nothing if no handlers are registered for the event', () => {
        const emitter = new EventEmitter();
        const spy = sinon.spy();

        emitter.emit('test', { test: 'test' });
        assertEqual(0, spy.callCount);
    });

    it('throws an error if eventName is not a string', () => {
        const emitter = new EventEmitter();
        const eventObj = { test: 'test' };

        assertThrows(() => emitter.emit(null, eventObj), 'Event name must be a string');
        assertThrows(() => emitter.emit(undefined, eventObj), 'Event name must be a string');
        assertThrows(() => emitter.emit(123, eventObj), 'Event name must be a string');
        assertThrows(() => emitter.emit({}, eventObj), 'Event name must be a string');
        assertThrows(() => emitter.emit([], eventObj), 'Event name must be a string');
    });

    it('passes undefined event data when no event object is provided', () => {
        const emitter = new EventEmitter();
        const spy = sinon.spy();

        emitter.on('test', spy);
        emitter.emit('test');

        assertEqual(1, spy.callCount);
        assertEqual(undefined, spy.firstCall.args[0]);
    });
});
