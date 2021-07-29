export interface Organization<T> {
    count: number;
    content: (keyof T)[];
}
