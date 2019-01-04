export interface ReadQuery {
    distinct?: boolean;
    table: string;
    columns?: Array<string>;
    selection?: string;
    selectionArgs?: Array<string>;
    groupBy?: string;
    having?: string;
    orderBy?: string;
    limit?: string;
}

export interface UpdateQuery {
    table: string;
    selection?: string;
    selectionArgs?: Array<string>;
    modelJson: any;
}

export interface InsertQuery {
    table: string;
    modelJson: any;
}
