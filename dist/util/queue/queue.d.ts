import { LinkedList } from '../list/linked-list';
import { ListNode } from '../list/list-node';
import { Comparator } from '../list/comparator';
export declare class Queue<T extends Comparator<T>> extends LinkedList<T> {
    constructor();
    enque(value: T): void;
    deque(): ListNode<T>;
}
