import {LinkedList} from '../list/linked-list';
import {ListNode} from '../list/list-node';
import {Comparator} from '../list/comparator';

export class Queue<T extends Comparator<T>> extends LinkedList<T> {

    constructor() {
        super();
    }

    public enque(value: T): void {
        super.add(value);
    }

    public deque(): ListNode<T> {
        const first = this.head;
        this.head = this.head.next;
        return first;
    }

}
