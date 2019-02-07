export abstract class SunbirdError extends Error {
    private readonly _code: string;

    protected constructor(message: string, code: string) {
        super(message);
        this._code = code;

        Object.setPrototypeOf(this, SunbirdError.prototype);
    }

    get code(): string {
        return this._code;
    }
}
