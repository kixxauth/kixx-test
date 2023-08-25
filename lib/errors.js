export class StackedError extends Error {

    constructor(message, spec, sourceFunction) {
        super(message);

        spec = spec || {};

        const name = this.constructor.NAME || this.constructor.name;

        Object.defineProperties(this, {
            name: {
                enumerable: true,
                value: name,
            },
            message: {
                enumerable: true,
                value: message,
            },
            code: {
                enumerable: true,
                value: spec.code || this.constructor.CODE,
            },
            fatal: {
                enumerable: true,
                value: Boolean(spec.fatal),
            },
            cause: {
                enumerable: true,
                value: spec.cause,
            },
            info: {
                enumerable: true,
                value: Object.assign({}, spec.info || {}),
            },
        });

        if (Error.captureStackTrace && sourceFunction) {
            Error.captureStackTrace(this, sourceFunction);
        }
    }
}

export class ProgrammerError extends StackedError { }

Object.defineProperties(ProgrammerError, {
    NAME: {
        enumerable: true,
        value: 'ProgrammerError',
    },
    CODE: {
        enumerable: true,
        value: 'PROGRAMMER_ERROR',
    },
});
