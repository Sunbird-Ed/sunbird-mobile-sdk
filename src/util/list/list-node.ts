export class ListNode<T> {

    private _next: ListNode<T>;
    private _value: T;


    get next(): ListNode<T> {
        return this._next;
    }

    set next(value: ListNode<T>) {
        this._next = value;
    }

    get value(): T {
        return this._value;
    }

    set value(value: T) {
        this._value = value;
    }
}
