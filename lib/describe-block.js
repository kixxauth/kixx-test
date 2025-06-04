import { DEFAULT_TIMEOUT } from './constants.js';
import RunnableBlock from './runnable-block.js';
import ProgrammerError from './programmer-error.js';


export default class DescribeBlock {
    namePath = [];
    disabled = false;
    timeout = DEFAULT_TIMEOUT;

    beforeBlocks = [];
    afterBlocks = [];
    testBlocks = [];
    childBlocks = [];

    constructor(spec) {
        this.namePath = spec.namePath;
        if (spec.disabled) {
            this.disabled = true;
        }
        if (Number.isInteger(spec.timeout)) {
            this.timeout = spec.timeout;
        }
    }

    createInterface() {
        return {
            before: this.createBeforeRegister(),
            after: this.createAfterRegister(),
            it: this.createTestRegister(),
            describe: this.createDescribeRegister(),
            xit: this.createDisabledTestRegister(),
            xdescribe: this.createDisabledDescribeRegister(),
        };
    }

    createDescribeRegister() {
        const describe = (name, fn, opts = {}) => {
            if (!name || typeof name !== 'string') {
                throw new ProgrammerError('First argument to describe() must be a string', {}, describe);
            }

            let disabled = false;
            if (this.disabled || opts.disabled || arguments.length === 1) {
                disabled = true;
            }

            if (!arguments.length > 1 && typeof fn !== 'function') {
                throw new ProgrammerError('Second argument to describe() must be a function', {}, describe);
            }

            const timeout = Number.isInteger(opts.timeout) ? opts.timeout : this.timeout;

            const newBlock = new DescribeBlock({
                namePath: this.pushName(name),
                disabled,
                timeout,
            });

            this.childBlocks.push(newBlock);

            fn(newBlock.createInterface());
        };

        return describe;
    }

    createBeforeRegister() {
        const before = (fn, opts = {}) => {
            if (typeof fn !== 'function') {
                throw new ProgrammerError('First argument to before() must be a function', {}, before);
            }

            const disabled = this.disabled ? true : Boolean(opts.disabled);
            const timeout = Number.isInteger(opts.timeout) ? opts.timeout : this.timeout;

            this.beforeBlocks.push(new RunnableBlock({
                type: 'before',
                namePath: this.pushName(`before[${ this.beforeBlocks.length }]`),
                fn,
                disabled,
                timeout,
            }));
        };

        return before;
    }

    createAfterRegister() {
        const after = (fn, opts = {}) => {
            if (typeof fn !== 'function') {
                throw new ProgrammerError('First argument to after() must be a function', {}, after);
            }

            const disabled = this.disabled ? true : Boolean(opts.disabled);
            const timeout = Number.isInteger(opts.timeout) ? opts.timeout : this.timeout;

            this.afterBlocks.push(new RunnableBlock({
                type: 'after',
                namePath: this.pushName(`after[${ this.beforeBlocks.length }]`),
                fn,
                disabled,
                timeout,
            }));
        };

        return after;
    }

    createTestRegister() {
        const it = (name, fn, opts = {}) => {
            if (!name || typeof name !== 'string') {
                throw new ProgrammerError('First argument to it() must be a string', {}, it);
            }

            // If only a name argument is given, this block is considered to be disabled.
            const disabled = this.disabled ? true : arguments.length === 1;
            const timeout = Number.isInteger(opts.timeout) ? opts.timeout : this.timeout;

            if (!arguments.length > 1 && typeof fn !== 'function') {
                throw new ProgrammerError('Second argument to it() must be a function', {}, it);
            }

            this.testBlocks.push(new RunnableBlock({
                type: 'test',
                namePath: this.pushName(name),
                fn,
                disabled,
                timeout,
            }));
        };

        return it;
    }

    createDisabledTestRegister() {
        const xit = (name) => {
            if (!name || typeof name !== 'string') {
                throw new ProgrammerError('First argument to xit() must be a string', {}, xit);
            }

            this.testBlocks.push(new RunnableBlock({
                type: 'test',
                namePath: this.pushName(name),
                fn: null,
                disabled: true,
            }));
        };

        return xit;
    }

    createDisabledDescribeRegister() {
        const xdescribe = (name, fn, opts = {}) => {
            if (!name || typeof name !== 'string') {
                throw new ProgrammerError('First argument to xdescribe() must be a string', {}, xdescribe);
            }

            if (!arguments.length > 1 && typeof fn !== 'function') {
                throw new ProgrammerError('Second argument to xdescribe() must be a function', {}, xdescribe);
            }

            const timeout = Number.isInteger(opts.timeout) ? opts.timeout : this.timeout;

            const newBlock = new DescribeBlock({
                namePath: this.pushName(name),
                disabled: true,
                timeout,
            });

            this.childBlocks.push(newBlock);

            fn(newBlock.createInterface());
        };

        return xdescribe;
    }

    pushName(latestName) {
        const namePath = this.namePath.slice();
        namePath.push(latestName);
        return namePath;
    }
}
