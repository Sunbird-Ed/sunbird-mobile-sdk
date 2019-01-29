export declare class QueryBuilder {
    private static ConstraintDecorator;
    private static WhereDecorator;
    private query;
    where(condition: string): any;
    build(): string;
}
