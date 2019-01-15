class Stack<T> {
    _stack: T[];

    constructor(stack?: T[]) {
        this._stack = stack || [];
    }

    push(item: T) {
        this._stack.push(item);
    }

    pop(): T {
        return this._stack.pop()!;
    }

    clear() {
        this._stack = [];
    }

    isEmpty() {
        return this._stack.length;
    }

    addAll(item: T[]) {
        this._stack = {
            ...this._stack,
            ...item
        };
    }

    get count(): number {
        return this._stack.length;
    }
}
