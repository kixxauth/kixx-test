export function createFake(fn) {
    let callCount = 0;
    const calls = [];

    function fakeWrapper(...args) {
        let firstArg;
        let lastArg;
        let error;
        let returnValue;

        Object.freeze(args);

        if (args.length > 0) {
            firstArg = args[0];
            lastArg = args[args.length - 1];
        }

        if (typeof fn === 'function') {
            try {
                // eslint-disable-next-line no-invalid-this
                returnValue = fn.apply(this, args);
            } catch (err) {
                error = err;
            }
        }

        callCount += 1;

        calls.push(Object.freeze({
            callCount,
            args,
            firstArg,
            lastArg,
            returnValue,
            error,
        }));
    }

    Object.defineProperties(fakeWrapper, {
        callCount: {
            enumerable: true,
            get() {
                return callCount;
            },
        },
        getCall: {
            enumerable: true,
            value: function getCall(index) {
                return calls[index];
            },
        },
    });

    return fakeWrapper;
}
