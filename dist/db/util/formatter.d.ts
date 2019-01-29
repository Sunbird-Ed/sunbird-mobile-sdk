export declare class ObjectMapper {
    static map(source: any, map: {
        [p: string]: string;
    }): {};
}
export declare class NoSqlFormatter {
    static toDb(obj: any): any;
    static fromDb(obj: any): any;
}
