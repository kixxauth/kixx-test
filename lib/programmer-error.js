export default class ProgrammerError extends Error {
    constructor(message, data, sourceFunction) {
        super(message, data);

        Object.defineProperties(this, {
            name: {
                enumerable: true,
                value: 'ProgrammerError',
            },
            code: {
                enumerable: true,
                value: 'PROGRAMMER_ERROR',
            },
        });

        if (Error.captureStackTrace && sourceFunction) {
            Error.captureStackTrace(this, sourceFunction);
        }
    }
}
