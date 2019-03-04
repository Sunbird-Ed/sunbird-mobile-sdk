import {ContentFeedback, ContentFeedbackFilterCriteria, ContentFeedbackService} from '..';
import {Observable} from 'rxjs';
import {ContentFeedbackEntry} from '../db/schema';
import {DbService, ReadQuery} from '../../db';
import {ContentFeedbackHandler} from '../handlers/content-feedback-handler';
import {QueryBuilder} from '../../db/util/query-builder';
import {ProfileService, ProfileSession} from '../../profile';
import {ContentUtil} from '../util/content-util';
import {ShareDirection, ShareItemType, ShareType, TelemetryService} from '../../telemetry';

export class ContentFeedbackServiceImpl implements ContentFeedbackService {

    constructor(private dbService: DbService,
                private profileService: ProfileService,
                private telemetryService: TelemetryService) {

    }

    getFeedback(contentFeedbackFilterCriteria: ContentFeedbackFilterCriteria): Observable<ContentFeedback[]> {
        const query = `SELECT * FROM ${ContentFeedbackEntry.TABLE_NAME} ${ContentUtil.getUidnIdentifierFiler(
            contentFeedbackFilterCriteria.uid, contentFeedbackFilterCriteria.contentId)}`;
        return this.dbService.execute(query).map((feedbackList: ContentFeedbackEntry.SchemaMap[]) => {
            return feedbackList.map((feedback: ContentFeedbackEntry.SchemaMap) =>
                ContentFeedbackHandler.mapFeedbackDBEntrytoResponseFeedback(feedback));
        });

    }

    sendFeedback(contentFeedback: ContentFeedback): Observable<boolean> {
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
                this.telemetryService.feedback({
                    env: 'sdk',
                    rating: contentFeedback.rating,
                    comments: contentFeedback.comments,
                    objId: contentFeedback.contentId,
                    objType: ShareItemType.CONTENT.valueOf(),
                    objVer: contentFeedback.contentVersion,
                })
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
