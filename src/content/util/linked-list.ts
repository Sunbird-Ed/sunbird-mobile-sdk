export class LinkedNode<T> {
    public next: LinkedNode<T> | null;
    private readonly _elem: T;

    constructor(elem: T) {
        this._elem = elem;
        this.next = null;
    }

    get elem(): T {
        return this._elem;
    }
}

export class LinkedList<T> {
    private head: LinkedNode<T> | null = null;
    private len = 0;

    constructor(headElement?: LinkedNode<T>) {
        this.head = headElement || null;
    }

    public append(elem: T) {
        const node = new LinkedNode(elem);
        let current: LinkedNode<T>;

        if (this.head === null) {
            this.head = node;
        } else {
            current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = node;
        }
        this.len++;
    }

    public isEmpty() {
        return this.len;
    }


    public addAll(list: T[]) {
        list.forEach((item) => {
            this.append(item);
        });
    }

    public remove(): LinkedNode<T> | undefined {
        return this.removeAt(0);
    }

    private removeAt(pos: number): LinkedNode<T> | undefined {
        if (pos > -1 && pos < this.len && this.head) {
            let current = this.head;
            let previous: LinkedNode<T> = current;
            let index = 0;

            if (pos === 0) {
                this.head = current.next;
            } else {
                while (index++ < pos && current.next) {
                    previous = current;
                    current = current.next;
                }
                previous.next = current.next;
            }
            this.len--;
            return current;
        } else {
            return undefined;
        }
    }

}
