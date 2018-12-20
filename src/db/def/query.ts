export type ReadQuery = {

    distinct: boolean,
    table: string,
    columns?: Array<string>,
    selection?: string,
    selectionArgs?: Array<string>,
    groupBy?: string,
    having?: string,
    orderBy?: string,
    limit?: string

}

export type UpdateQuery = {
    table: string,
    selection?: string,
    selectionArgs?: Array<string>,
}

export type InsertQuery = {

    table: string,
    modelJson: string

}