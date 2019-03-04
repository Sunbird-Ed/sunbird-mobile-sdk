import {DbService} from '../../db';
import {Content, ContentFeedbackService, ContentRequest, ContentSortCriteria} from '..';
import {ContentAccessEntry, ContentEntry, ContentMarkerEntry} from '../db/schema';
import {State, Visibility} from '../util/content-constants';
import {ContentAccess} from '../../profile/def/content-access';
import {ProfileService} from '../../profile';

export class GetContentsHandler {


    getAllLocalContentQuery(request: ContentRequest): string {
        const uid = request.uid;
        const contentTypesStr = request.contentTypes.join(',');
        let contentTypeFilter = `c.${ContentEntry.COLUMN_NAME_CONTENT_TYPE} in('${contentTypesStr.toLowerCase()}')`;
        const contentVisibilityFilter = `c.${ContentEntry.COLUMN_NAME_VISIBILITY} = '${Visibility.DEFAULT.valueOf()}'`;
        const artifactAvailabilityFilter = `c.${ContentEntry.COLUMN_NAME_CONTENT_STATE} = '${State.ARTIFACT_AVAILABLE.valueOf()}'`;
        let filter = `${contentVisibilityFilter} AND ${artifactAvailabilityFilter} AND ${contentTypeFilter}`;
        let whereClause = `WHERE (${filter})`;
        let query = '';
        const orderBy = this.generateSortByQuery(request.sortCriteria!, uid);
        if (request.recentlyViewed) {
            if (uid) {
                contentTypeFilter = `ca.${ContentAccessEntry.COLUMN_NAME_CONTENT_TYPE} IN ('${contentTypesStr.toLowerCase()}')`;
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

    private getRecentlyViewedQuery(whereClause: string, orderBy: string, limit: number): string {
        return `SELECT c.*, ca.${ContentAccessEntry.COLUMN_NAME_EPOCH_TIMESTAMP}
                cm.${ContentMarkerEntry.COLUMN_NAME_DATA} FROM ${ContentAccessEntry.TABLE_NAME} c LEFT JOIN
                ${ContentMarkerEntry.TABLE_NAME} cm ON
                cm.${ContentMarkerEntry.COLUMN_NAME_CONTENT_IDENTIFIER} = ca.${ContentAccessEntry.COLUMN_NAME_CONTENT_IDENTIFIER} LEFT JOIN
                ${ContentEntry.TABLE_NAME}  c ON
                c.${ContentEntry.COLUMN_NAME_IDENTIFIER} = ca.${ContentAccessEntry.COLUMN_NAME_CONTENT_IDENTIFIER}
                ${whereClause} ${orderBy} LIMIT limit`;
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
        if (sortCriteriaList) {
            sortCriteriaList.forEach((sortCriteria) => {
                if (sortCriteria) {
                    if ('lastUsedOn' === sortCriteria.sortAttribute.valueOf() && uid) {
                        orderBy = this.generateOrderByQuery(i, orderBy, ContentAccessEntry.COLUMN_NAME_EPOCH_TIMESTAMP,
                            sortCriteria.sortOrder.valueOf());
                    } else if ('localLastUpdatedOn' === sortCriteria.sortAttribute.valueOf()) {
                        orderBy = this.generateOrderByQuery(i, orderBy, ContentEntry.COLUMN_NAME_LOCAL_LAST_UPDATED_ON,
                            sortCriteria.sortOrder.valueOf());
                    } else if ('sizeOnDevice' === sortCriteria.sortAttribute.valueOf()) {
                        orderBy = this.generateOrderByQuery(i, orderBy, ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE,
                            sortCriteria.sortOrder.valueOf());
                    }
                }
                i++;
            });
        }
        return orderBy;

    }

    private generateOrderByQuery(index: number, orderBy: string, columnName, sortOrder: string): string {
        let orderByQuery = '';
        if (index > 0) {
            orderByQuery = orderBy.concat(',');
        } else {
            orderByQuery = orderBy.concat('ORDER BY');
        }
        orderByQuery.concat(` ca.${columnName} ${sortOrder}`);
        return orderByQuery;
    }




}
