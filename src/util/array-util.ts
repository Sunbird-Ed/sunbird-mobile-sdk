export class ArrayUtil {

    public static joinPreservingQuotes(array: string[]): string {
        return array.map(i => `'${i}'`).join(',');
    }

    public static isEmpty<T>(array: T[]): boolean {
        return array && array.length === 0;
    }

    public static contains(array: string[], item: string): boolean {
        return array && array.indexOf(item) !== -1;
    }
}
