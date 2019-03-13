import {ContentRequest, ContentSortCriteria, SortOrder, State, Visibility} from '..';
import {ContentAccessEntry, ContentEntry, ContentMarkerEntry} from '../db/schema';
import {ArrayUtil} from '../../util/array-util';

export class GetContentsHandler {


    getAllLocalContentQuery(request: ContentRequest): string {
        if (!request.contentTypes || !request.contentTypes.length) {
            request.contentTypes = ['Story', 'Worksheet', 'Game', 'Resource', 'Collection', 'TextBook'];
        }
        if (request.resourcesOnly) {
            request.contentTypes = ['Story', 'Worksheet', 'Game', 'Resource'];
        }
        const uid = request.uid;
        const contentTypesStr = ArrayUtil.joinPreservingQuotes(request.contentTypes);
        let contentTypeFilter = `c.${ContentEntry.COLUMN_NAME_CONTENT_TYPE} IN(${contentTypesStr.toLowerCase()})`;
        const contentVisibilityFilter = request.resourcesOnly ? '' :
            `c.${ContentEntry.COLUMN_NAME_VISIBILITY} = '${Visibility.DEFAULT.valueOf()}' AND`;
        const artifactAvailabilityFilter = `c.${ContentEntry.COLUMN_NAME_CONTENT_STATE} = '${State.ARTIFACT_AVAILABLE.valueOf()}'`;
        let filter = `${contentVisibilityFilter} ${artifactAvailabilityFilter} AND ${contentTypeFilter}`;
        const audienceFilter = this.getAudienceFilter(request.audience!);
        const pragmaFilter = this.getPragmaFilter(request.exclPragma!, request.pragma!);

        if (audienceFilter) {
            filter = `${filter}  AND (${audienceFilter})`;
        }
        if (pragmaFilter) {
            filter = `${filter}  AND (${pragmaFilter})`;
        }
        let whereClause = `WHERE (${filter})`;
        let query = '';
        const orderBy = request.resourcesOnly ? '' : this.generateSortByQuery(request.sortCriteria!, uid!);
        if (request.recentlyViewed) {
            if (uid) {
                contentTypeFilter = `ca.${ContentAccessEntry.COLUMN_NAME_CONTENT_TYPE} IN (${contentTypesStr.toLowerCase()})`;
                if (request.localOnly) {
                    filter = `ca.${ContentAccessEntry.COLUMN_NAME_UID} = '${uid}' AND ${contentTypeFilter}
                     AND ${artifactAvailabilityFilter}`;
                } else {
                    filter = `ca.${ContentAccessEntry.COLUMN_NAME_UID} = '${uid}' AND ${contentTypeFilter}`;

                }
                whereClause = `WHERE (${filter})`;
                query = this.getRecentlyViewedQuery(whereClause, orderBy, request.limit!);
            }
        } else {
            if (uid) {
                query = this.getLocalOnlyQuery(whereClause, orderBy, uid);
            } else {
                query = `SELECT c.* FROM ${ContentEntry.TABLE_NAME} c ${whereClause} ${orderBy}`;
            }
        }
        return query;

    }

    private getAudienceFilter(audience: string[]): string {
        let filter = '';
        if (audience) {
            audience.forEach((element) => {
                filter = filter.concat(filter.length > 0 ? ' OR ' : '', `c.${ContentEntry.COLUMN_NAME_AUDIENCE} LIKE '%%${element}%%'`);
            });
        }
        return filter;
    }

    private getPragmaFilter(exclPragma: string[], pragma: string[]): string {
        let filter = '';
        if (exclPragma) {
            exclPragma.forEach((element) => {
                filter = filter.concat(filter.length > 0 ? ' OR ' : '', `c.${ContentEntry.COLUMN_NAME_PRAGMA} NOT LIKE '%%${element}%%'`);
            });
        } else if (pragma) {
            pragma.forEach((element) => {
                filter = filter.concat(filter.length > 0 ? ' OR ' : '', `c.${ContentEntry.COLUMN_NAME_PRAGMA} LIKE '%%${element}%%'`);
            });
        }
        return filter;
    }

    private getRecentlyViewedQuery(whereClause: string, orderBy: string, limit: number): string {
        return `SELECT c.*, ca.${ContentAccessEntry.COLUMN_NAME_EPOCH_TIMESTAMP},
                cm.${ContentMarkerEntry.COLUMN_NAME_DATA} FROM ${ContentAccessEntry.TABLE_NAME} ca LEFT JOIN
                ${ContentMarkerEntry.TABLE_NAME} cm ON
                cm.${ContentMarkerEntry.COLUMN_NAME_CONTENT_IDENTIFIER} = ca.${ContentAccessEntry.COLUMN_NAME_CONTENT_IDENTIFIER} LEFT JOIN
                ${ContentEntry.TABLE_NAME}  c ON
                c.${ContentEntry.COLUMN_NAME_IDENTIFIER} = ca.${ContentAccessEntry.COLUMN_NAME_CONTENT_IDENTIFIER}
                ${whereClause} ${orderBy} LIMIT ${limit}`;
    }

    private getLocalOnlyQuery(whereClause: string, orderBy: string, uid: string): string {
        return `SELECT c.*, ca.${ContentAccessEntry.COLUMN_NAME_EPOCH_TIMESTAMP}
                FROM ${ContentEntry.TABLE_NAME} c LEFT JOIN ${ContentAccessEntry.TABLE_NAME} ca
                ON c.${ContentEntry.COLUMN_NAME_IDENTIFIER} = ca.${ContentAccessEntry.COLUMN_NAME_CONTENT_IDENTIFIER}
                AND ca.${ContentAccessEntry.COLUMN_NAME_UID} ='${uid}'
                ${whereClause} ${orderBy}`;
    }

    private generateSortByQuery(sortCriteriaList: ContentSortCriteria[], uid: string): string {
        let orderBy = '';
        let i = 0;
        if (!sortCriteriaList) {
            sortCriteriaList = [];
            sortCriteriaList.push({sortAttribute: 'lastUsedOn', sortOrder: SortOrder.DESC});
            sortCriteriaList.push({sortAttribute: 'localLastUpdatedOn', sortOrder: SortOrder.DESC});
        }
        sortCriteriaList.forEach((sortCriteria) => {
            if (sortCriteria) {
                if ('lastUsedOn' === sortCriteria.sortAttribute.valueOf() && uid) {
                    orderBy = this.generateOrderByQuery(i, orderBy, ` ca.${ContentAccessEntry.COLUMN_NAME_EPOCH_TIMESTAMP}`,
                        sortCriteria.sortOrder.valueOf());
                } else if ('localLastUpdatedOn' === sortCriteria.sortAttribute.valueOf()) {
                    orderBy = this.generateOrderByQuery(i, orderBy, ` c.${ContentEntry.COLUMN_NAME_LOCAL_LAST_UPDATED_ON}`,
                        sortCriteria.sortOrder.valueOf());
                } else if ('sizeOnDevice' === sortCriteria.sortAttribute.valueOf()) {
                    orderBy = this.generateOrderByQuery(i, orderBy, ` c.${ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE}`,
                        sortCriteria.sortOrder.valueOf());
                }
            }
            i++;
        });
        return orderBy;

    }

    private generateOrderByQuery(index: number, orderBy: string, columnName, sortOrder: string): string {
        let orderByQuery = '';
        if (index > 0) {
            orderByQuery = orderBy.concat(',');
        } else {
            orderByQuery = orderBy.concat('ORDER BY');
        }
        orderByQuery = orderByQuery.concat(`${columnName} ${sortOrder}`);
        return orderByQuery;
    }


}
