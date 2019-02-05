export class QueryBuilder {
    private static ConstraintDecorator = class ConstraintDecorator {
        private readonly queryBuilder: QueryBuilder;

        constructor(queryBuilder: QueryBuilder) {
            this.queryBuilder = queryBuilder;
        }

        and(): QueryBuilder {
            this.queryBuilder.query += ' AND ';
            return this.queryBuilder;
        }

        or(): QueryBuilder {
            this.queryBuilder.query += ' OR ';
            return this.queryBuilder;
        }

        end(): QueryBuilder {
            return this.queryBuilder;
        }
    };

    private static WhereDecorator = class WhereDecorator {
        private readonly queryBuilder: QueryBuilder;

        constructor(queryBuilder: QueryBuilder) {
            this.queryBuilder = queryBuilder;
        }

        args(args: string[]) {
            args.forEach((arg) => {
                this.interpolate(arg);
            });

            return new QueryBuilder.ConstraintDecorator(this.queryBuilder);
        }

        interpolate(arg: string) {
            if (isNaN(arg as any)) {
                arg = '"' + arg + '"';
            }
            this.queryBuilder.query = this.queryBuilder.query.replace('?', arg);
        }
    };

    private query = '';

    where(condition: string): any {
        this.query += condition.trim();

        return new QueryBuilder.WhereDecorator(this);
    }

    build(): string {
        return this.query;
    }
}

