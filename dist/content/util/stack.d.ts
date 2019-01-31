export declare class Stack<T> {
    private _stack;
    constructor(stack?: T[]);
    readonly count: number;
    push(item: T): void;
    pop(): T;
    clear(): void;
    isEmpty(): boolean;
    addAll(item: T[]): void;
}
