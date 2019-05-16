export class NumberUtil {
    public static toFixed(input): number {
        return Number(input.toFixed(2));
    }

    public static parseInt(input): number {
        return input ? parseInt(input, 10) : 0;
    }

    public static round(input): number {
        return Number(Math.round(parseFloat(input + 'e' + 4)) + 'e-' + 4);
    }
}
