export class ArrayUtil {

    public static joinPreservingQuotes(array: string[]): string {
        return array.map(i => `'${i}'`).join(',');
    }
}
