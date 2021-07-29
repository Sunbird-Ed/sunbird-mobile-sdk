export declare class ObjectUtil {
    static equals(a: any, b: any): boolean;
    static getPropDiff(newObj: {}, oldObj: {}): string[];
    static getTruthyProps(obj: {}): string[];
    static toOrderedString(obj: {}): string;
}
