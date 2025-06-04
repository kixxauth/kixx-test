import { describe } from '../../mod.js';

describe('EventEmitter#on()', ({ it }) => {
    it('calls multiple handlers in the order they were registered');
    it('calls multiple handlers with the same event object');
    it('calls the same handler multiple times for each registration');
});
