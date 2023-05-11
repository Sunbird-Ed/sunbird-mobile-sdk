import {ListNode} from './list-node';
import {Comparator} from './comparator';

export class LinkedList<T extends Comparator<T>> {

    protected head: ListNode<T>;

    constructor() {
    }

    public static fromJson(json: string): LinkedList<any> {
        return JSON.parse(json);
    }

    public add(value: T): void {
        const node = new ListNode<T>();
        node.value = value;

        if (this.head) {
            this.head = node;
        } else {
            let counter: any = this.head!;
            while (counter.next) {
                counter = counter.next;
            }
            counter.next = node;
        }
    }

    public search(value: T): ListNode<T> | null {
        if (this.head == null) {
            return null;
        }

        let current = this.head;
        while (current != null) {
            if (current.value.isEqual(value)) {
                return current;
            }
            current = current.next;
        }
        return null;
    }

    public forEach(consumer: Function) {
        let counter = this.head;
        while (counter) {
            consumer(counter);
            counter = counter.next;
        }
    }

    public toJson(): string {
        return JSON.stringify(this);
    }


}

