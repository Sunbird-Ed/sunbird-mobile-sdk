import { ListNode } from './list-node';
import { Comparator } from './comparator';
export declare class LinkedList<T extends Comparator<T>> {
    protected head: ListNode<T>;
    constructor();
    static fromJson(json: string): LinkedList<any>;
    add(value: T): void;
    search(value: T): ListNode<T> | null;
    forEach(consumer: Function): void;
    toJson(): string;
}
