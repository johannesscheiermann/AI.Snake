export class Lazy<T> {
    constructor(private readonly init: () => T) {
    }

    private _value: T | undefined

    public get value(): T {
        return this._value ??= this.init()
    }
}