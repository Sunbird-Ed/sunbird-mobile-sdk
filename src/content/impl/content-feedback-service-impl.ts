import {ContentFeedbackService} from '../def/content-feedback-service';
import {ContentFeedback, ContentFeedbackFilterCriteria} from '..';
import {Observable} from 'rxjs';
import {ContentFeedbackEntry} from '../db/schema';
import {DbService, ReadQuery} from '../../db';
import {ContentFeedbackHandler} from '../handlers/content-feedback-handler';
import {QueryBuilder} from '../../db/util/query-builder';
import {ProfileService, ProfileSession} from '../../profile';

export class ContentFeedbackServiceImpl implements ContentFeedbackService {

    constructor(private dbService: DbService,
                private profileService: ProfileService) {

    }

    getFeedback(contentFeedbackFilterCriteria: ContentFeedbackFilterCriteria): Observable<ContentFeedback[]> {
        let userFilter = '';
        let contentFilter = '';
        if (contentFeedbackFilterCriteria) {
            if (contentFeedbackFilterCriteria.uid) {
                userFilter = `${ContentFeedbackEntry.COLUMN_NAME_UID} = '${contentFeedbackFilterCriteria.uid}'`;
            }
            if (contentFeedbackFilterCriteria.contentId) {
                contentFilter = `${ContentFeedbackEntry.COLUMN_NAME_CONTENT_ID} = '${contentFeedbackFilterCriteria.contentId}'`;
            }
        }
        let filter = '';
        if (userFilter && contentFilter) {
            filter = filter.concat(` where ${userFilter} AND ${contentFilter}`);
        } else if (contentFilter) {
            filter = filter.concat(` where ${contentFilter}`);
        } else if (userFilter) {
            filter = filter.concat(` where ${userFilter}`);
        }
        const query = `SELECT * FROM ${ContentFeedbackEntry.TABLE_NAME} ${filter}`;
        return this.dbService.execute(filter).map((feedbackList: ContentFeedbackEntry.SchemaMap[]) => {
            return feedbackList.map((feedback: ContentFeedbackEntry.SchemaMap) =>
                ContentFeedbackHandler.mapFeedbackDBEntrytoResponseFeedback(feedback));
        });

    }

    sendFeedback(contentFeedback: ContentFeedback): Observable<any> {
        // TODO generate feedback event
        return this.profileService.getActiveProfileSession()
            .mergeMap((response: ProfileSession | undefined) => {
                const readQuery: ReadQuery = {
                    table: ContentFeedbackEntry.TABLE_NAME,
                    selection: new QueryBuilder()
                        .where('? = ? AND ? = ?')
                        .args([ContentFeedbackEntry.COLUMN_NAME_CONTENT_ID,
                            contentFeedback.contentId, ContentFeedbackEntry.COLUMN_NAME_UID, response!.uid])
                        .end()
                        .build(),
                    limit: '1'
                };
                return this.dbService.read(readQuery).mergeMap((rows) => {
                    if (rows && rows.length) {
                        return this.dbService.update({
                            table: ContentFeedbackEntry.TABLE_NAME,
                            modelJson: rows[0]
                        });
                    } else {
                        return this.dbService.insert({
                            table: ContentFeedbackEntry.TABLE_NAME,
                            modelJson: rows[0]
                        }).map(v => v > 0);
                    }
                });
            });

    }

}
