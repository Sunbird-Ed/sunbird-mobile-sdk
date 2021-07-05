import {ContentRequest, ContentSortCriteria, MimeType, SortOrder, State, Visibility} from '..';
import {ContentAccessEntry, ContentEntry, ContentMarkerEntry} from '../db/schema';
import {ArrayUtil} from '../../util/array-util';

export class GetContentsHandler {


    getAllLocalContentQuery(request: ContentRequest): string {
        if (!request.primaryCategories || !request.primaryCategories.length) {
            request.primaryCategories = [
                'Course',
                'Learning Resource',
                'Explanation Content',
                'Teacher Resource',
                'Content Playlist',
                'Digital Textbook',
                'Practice Question Set',
                'eTextBook',
                'Course Assessment'
            ];
        }
        const uid = request.uid;

        const contentVisibilityFilter = request.resourcesOnly ? '' :
            `c.${ContentEntry.COLUMN_NAME_VISIBILITY} = '${Visibility.DEFAULT.valueOf()}' AND`;
        const artifactAvailabilityFilter = `c.${ContentEntry.COLUMN_NAME_CONTENT_STATE} = '${State.ARTIFACT_AVAILABLE.valueOf()}'`;
        let filter = `${contentVisibilityFilter} ${artifactAvailabilityFilter}`;

        if (request.resourcesOnly) {
            const mimeTypeFilter = `c.${ContentEntry.COLUMN_NAME_MIME_TYPE} != '${MimeType.COLLECTION.valueOf()}'`;
            filter = `${filter}  AND (${mimeTypeFilter})`;
        } else {
            const primaryCategoryString = ArrayUtil.joinPreservingQuotes(request.primaryCategories);
            const primaryCategoryFilter = `c.${ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY} IN(${primaryCategoryString.toLowerCase()})`;
            filter = `${filter}  AND (${primaryCategoryFilter})`;
        }

        const audienceFilter = this.getAudienceFilter(request.audience!);
        const pragmaFilter = this.getPragmaFilter(request.exclPragma!, request.pragma!);

        const offlineSearchQuery = this.generateFieldMatchQuery(request);
        if (audienceFilter) {
            filter = `${filter}  AND (${audienceFilter})`;
        }
        if (pragmaFilter) {
            filter = `${filter}  AND (${pragmaFilter})`;
        }

        if (offlineSearchQuery) {
            filter = `${filter}  AND (${offlineSearchQuery})`;
        }
        let whereClause = `WHERE (${filter})`;
        let query = '';
        const orderBy = request.resourcesOnly ? '' : this.generateSortByQuery(request.sortCriteria!, uid!);
        if (request.recentlyViewed) {
            if (uid) {
                if (request.localOnly) {
                    filter = `ca.${ContentAccessEntry.COLUMN_NAME_UID} = '${uid}' AND ${artifactAvailabilityFilter}
                    AND cm.${ContentEntry.COLUMN_NAME_MIME_TYPE} NOT IN ('${MimeType.COLLECTION.valueOf()}', '')`;
                } else {
                    filter = `ca.${ContentAccessEntry.COLUMN_NAME_UID} = '${uid}'
                    AND cm.${ContentEntry.COLUMN_NAME_MIME_TYPE} NOT IN ('${MimeType.COLLECTION.valueOf()}', '')`;
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
                (cm.${ContentMarkerEntry.COLUMN_NAME_UID} = ca.${ContentAccessEntry.COLUMN_NAME_UID}
                AND cm.${ContentMarkerEntry.COLUMN_NAME_CONTENT_IDENTIFIER} = ca.${ContentAccessEntry.COLUMN_NAME_CONTENT_IDENTIFIER})
                LEFT JOIN ${ContentEntry.TABLE_NAME}  c ON
                c.${ContentEntry.COLUMN_NAME_IDENTIFIER} = ca.${ContentAccessEntry.COLUMN_NAME_CONTENT_IDENTIFIER}
                ${whereClause} ${orderBy} LIMIT ${limit}`;
    }

    private getLocalOnlyQuery(whereClause: string, orderBy: string, uid: string | string[]): string {
        let uidFilter = '';
        if (Array.isArray(uid)) {
            uidFilter = `ca.${ContentAccessEntry.COLUMN_NAME_UID} IN (${ArrayUtil.joinPreservingQuotes(uid)})`;
        } else {
            uidFilter = `ca.${ContentAccessEntry.COLUMN_NAME_UID} ='${uid}'`;
        }
        return `SELECT c.*, ca.${ContentAccessEntry.COLUMN_NAME_EPOCH_TIMESTAMP}
                FROM ${ContentEntry.TABLE_NAME} c LEFT JOIN ${ContentAccessEntry.TABLE_NAME} ca
                ON c.${ContentEntry.COLUMN_NAME_IDENTIFIER} = ca.${ContentAccessEntry.COLUMN_NAME_CONTENT_IDENTIFIER}
                AND ${uidFilter}
                ${whereClause} ${orderBy}`;
    }

    private generateSortByQuery(sortCriteriaList: ContentSortCriteria[], uid: string | string[]): string {
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
                    i++;
                } else if ('localLastUpdatedOn' === sortCriteria.sortAttribute.valueOf()) {
                    orderBy = this.generateOrderByQuery(i, orderBy, ` c.${ContentEntry.COLUMN_NAME_LOCAL_LAST_UPDATED_ON}`,
                        sortCriteria.sortOrder.valueOf());
                    i++;
                } else if ('sizeOnDevice' === sortCriteria.sortAttribute.valueOf()) {
                    orderBy = this.generateOrderByQuery(i, orderBy, ` c.${ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE}`,
                        sortCriteria.sortOrder.valueOf());
                    i++;
                }
            }
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

    private generateFieldMatchQuery(request: ContentRequest): string {
        const fields = [
            { field: 'board', column: ContentEntry.COLUMN_NAME_BOARD },
            { field: 'medium', column: ContentEntry.COLUMN_NAME_MEDIUM },
            { field: 'grade', column: ContentEntry.COLUMN_NAME_GRADE },
            { field: 'dialcodes', column: ContentEntry.COLUMN_NAME_DIALCODES },
            { field: 'childNodes', column: ContentEntry.COLUMN_NAME_CHILD_NODES }
        ];

        return fields.reduce<string[]>((acc, {field, column}) => {
            if (request[field] && request[field].length) {
                acc.push(this.generateLikeQuery(request[field], column));
            }

            return acc;
        }, []).join(` AND `);
    }

    private generateLikeQuery(data: string[], coloumnName: string): string {
        let likeQuery = '';
        const initialQuery = `${coloumnName} LIKE `;
        for (let i = 0; i < data.length; i++) {
            if (i < data.length - 1) {
                likeQuery = likeQuery.concat(initialQuery, `'%%~${data[i].toLowerCase().trim()}~%%' OR `);
            } else {
                likeQuery = likeQuery.concat(initialQuery, `'%%~${data[i].toLowerCase().trim()}~%%' `);
            }
        }
        return `(${likeQuery})`;
    }


}
