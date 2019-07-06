export class Stack<T> {
    private _stack: T[];

    constructor(stack?: T[]) {
        this._stack = stack || [];
    }

    public get count(): number {
        return this._stack.length;
    }

    public push(item: T) {
        this._stack.push(item);
    }

    public pop(): T {
        return this._stack.pop()!;
    }

    public clear() {
        this._stack = [];
    }

    public isEmpty(): boolean {
        return (this._stack.length === 0);
    }

    public addAll(item: T[]) {
        this._stack = [
            ...this._stack,
            ...item
        ];
    }
}
