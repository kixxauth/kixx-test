import { assertEqual } from 'kixx-assert';
import EventEmitter from '../../lib/event-emitter.js';
import sinon from 'sinon';
import { describe } from '../../mod.js';
import RunnableBlock from '../../lib/runnable-block.js';


describe('RunnableBlock#run() when disabled', ({ it }) => {
    it('does not call the setTimeout function when disabled', () => {
        const mockSetTimeoutSpy = sinon.spy();
        const mockClearTimeoutSpy = sinon.spy();
        const blockFunctionSpy = sinon.spy();

        const block = new RunnableBlock({
            type: 'test',
            namePath: [ 'test' ],
            fn: blockFunctionSpy,
            disabled: true,
            setTimeout: mockSetTimeoutSpy,
            clearTimeout: mockClearTimeoutSpy,
        });

        block.run();

        assertEqual(0, mockSetTimeoutSpy.callCount);
        assertEqual(0, mockClearTimeoutSpy.callCount);
        assertEqual(0, blockFunctionSpy.callCount);
    });

    it('does not call the fn function when disabled', () => {
        const mockSetTimeoutSpy = sinon.spy();
        const mockClearTimeoutSpy = sinon.spy();
        const blockFunctionSpy = sinon.spy();

        const block = new RunnableBlock({
            type: 'test',
            namePath: [ 'test' ],
            fn: blockFunctionSpy,
            disabled: true,
            setTimeout: mockSetTimeoutSpy,
            clearTimeout: mockClearTimeoutSpy,
        });

        block.run();

        assertEqual(0, mockSetTimeoutSpy.callCount);
        assertEqual(0, mockClearTimeoutSpy.callCount);
        assertEqual(0, blockFunctionSpy.callCount);
    });

    it('sets the timeout with a custom timeout', async () => {
        const emitter = new EventEmitter();
        const mockSetTimeoutSpy = sinon.spy();
        const mockClearTimeoutSpy = sinon.spy();
        const blockFunctionSpy = sinon.spy();

        const block = new RunnableBlock({
            type: 'test',
            namePath: [ 'test' ],
            fn: blockFunctionSpy,
            disabled: false,
            setTimeout: mockSetTimeoutSpy,
            clearTimeout: mockClearTimeoutSpy,
        });

        await block.run(emitter, { timeout: 5000 });

        assertEqual(1, mockSetTimeoutSpy.callCount);
        assertEqual(5000, mockSetTimeoutSpy.args[0][1]);
        assertEqual(1, mockClearTimeoutSpy.callCount);
    });

    it('assumes to return a Promise when no params are passed into the block function', async () => {
        const emitter = new EventEmitter();

        let flippedBit = false;
        const blockFunctionSpy = sinon.spy(() => {
            return Promise.resolve(null).then(() => {
                flippedBit = true;
            });
        });

        const timeoutHandle = {};
        const mockSetTimeoutSpy = sinon.fake.returns(timeoutHandle);
        const mockClearTimeoutSpy = sinon.spy();

        const block = new RunnableBlock({
            type: 'test',
            namePath: [ 'test' ],
            fn: blockFunctionSpy,
            disabled: false,
            setTimeout: mockSetTimeoutSpy,
            clearTimeout: mockClearTimeoutSpy,
        });

        await block.run(emitter);

        assertEqual(1, blockFunctionSpy.callCount);
        assertEqual(true, flippedBit);
        assertEqual(1, mockSetTimeoutSpy.callCount);
        assertEqual(1, mockClearTimeoutSpy.callCount);
        assertEqual(timeoutHandle, mockClearTimeoutSpy.firstCall.args[0]);
    });

    it('waits for a callback when passed into the block function', async () => {
        const emitter = new EventEmitter();

        let flippedBit = false;
        const blockFunctionSpy = sinon.spy((callback) => {
            setTimeout(callback, 10);
            flippedBit = true;
        });

        const timeoutHandle = {};
        const mockSetTimeoutSpy = sinon.fake.returns(timeoutHandle);
        const mockClearTimeoutSpy = sinon.spy();

        const block = new RunnableBlock({
            type: 'test',
            namePath: [ 'test' ],
            fn: blockFunctionSpy,
            disabled: false,
            setTimeout: mockSetTimeoutSpy,
            clearTimeout: mockClearTimeoutSpy,
        });

        await block.run(emitter);

        assertEqual(1, blockFunctionSpy.callCount);
        assertEqual(true, flippedBit);
        assertEqual(1, mockSetTimeoutSpy.callCount);
        assertEqual(1, mockClearTimeoutSpy.callCount);
        assertEqual(timeoutHandle, mockClearTimeoutSpy.firstCall.args[0]);
    });
});
