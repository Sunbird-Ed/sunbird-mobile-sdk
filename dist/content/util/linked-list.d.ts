export declare class LinkedNode<T> {
    next: LinkedNode<T> | null;
    private readonly _elem;
    constructor(elem: T);
    readonly elem: T;
}
export declare class LinkedList<T> {
    private head;
    private len;
    constructor(headElement?: LinkedNode<T>);
    append(elem: T): void;
    isEmpty(): number;
    addAll(list: T[]): void;
    remove(): LinkedNode<T> | undefined;
    private removeAt;
}
