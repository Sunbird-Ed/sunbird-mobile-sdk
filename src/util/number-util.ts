export class NumberUtil {
    public static toPrecision(input): number {
        return Number(Number(input).toPrecision(3));
    }

    public static parseInt(input): number {
        return parseInt(input, 10);
    }
}
