import {CourseServiceImpl, UpdateContentStateRequest} from '..';
import {UpdateContentStateApiHandler} from './update-content-state-api-handler';
import {CourseUtil} from '../course-util';
import {KeyValueStore} from '../../key-value-store';
import {KeyValueStoreEntry} from '../../key-value-store/db/schema';
import {DbService} from '../../db';
import {SharedPreferences} from '../../util/shared-preferences';
import {from, Observable, of} from 'rxjs';
import {map, mapTo, mergeMap} from 'rxjs/operators';

export class ContentStatesSyncHandler {

    constructor(private updateContentStateHandler: UpdateContentStateApiHandler,
                private dbService: DbService,
                private sharedPreferences: SharedPreferences,
                private keyValueStore: KeyValueStore) {

    }

    public updateContentState(): Observable<boolean> {
        return this.prepareContentStateRequest()
            .pipe(
                mergeMap((updateContentRequestMap: { [key: string]: UpdateContentStateRequest[] }) => {
                    return from(this.invokeContentStateAPI(updateContentRequestMap));
                })
            );
    }


    private prepareContentStateRequest(): Observable<{ [key: string]: UpdateContentStateRequest[] }> {
        const query = `SELECT * FROM ${KeyValueStoreEntry.TABLE_NAME}
                           WHERE ${KeyValueStoreEntry.COLUMN_NAME_KEY}
                           LIKE '%%${CourseServiceImpl.UPDATE_CONTENT_STATE_KEY_PREFIX}%%'`;
        return this.dbService.execute(query)
            .pipe(
                map((keyValueEntries: KeyValueStoreEntry.SchemaMap[]) => {
                    const updateContentRequestMap: { [key: string]: UpdateContentStateRequest[] } = {};
                    keyValueEntries.forEach((keyValueEntry: KeyValueStoreEntry.SchemaMap) => {
                        const updateContentStateRequest: UpdateContentStateRequest =
                            JSON.parse(keyValueEntry['value']) as UpdateContentStateRequest;
                        if (updateContentStateRequest && updateContentStateRequest.userId) {
                            if (updateContentRequestMap.hasOwnProperty(updateContentStateRequest.userId)) {
                                updateContentRequestMap[updateContentStateRequest.userId].push(updateContentStateRequest);
                            } else {
                                const updateContentStateRequestList: UpdateContentStateRequest[] = [];
                                updateContentRequestMap[updateContentStateRequest.userId] = [updateContentStateRequest];
                            }
                        }
                    });
                    return updateContentRequestMap;
                })
            );

    }


    private async invokeContentStateAPI(userContentStateMap: { [key: string]: UpdateContentStateRequest[] }): Promise<boolean> {

        for (const userId of Object.keys(userContentStateMap)) {
            try {
                const result: { [key: string]: any } = await this.updateContentStateHandler.handle(
                    CourseUtil.getUpdateContentStateListRequest(userId, userContentStateMap[userId])).toPromise();
                if (result) {
                    await this.deleteContentState(userContentStateMap[userId], result);
                }
            } catch (e) {
            }
        }
        return Promise.resolve(true);
    }

    private async deleteContentState(contentSateRequestList: UpdateContentStateRequest[], result: { [key: string]: any })
        : Promise<boolean> {

        for (const contentSateRequest of contentSateRequestList) {
            if (result.hasOwnProperty(contentSateRequest.contentId) ||
                (result[contentSateRequest.contentId] && result[contentSateRequest.contentId] !== 'FAILED')) {
                const key = CourseServiceImpl.UPDATE_CONTENT_STATE_KEY_PREFIX
                    .concat(contentSateRequest.userId)
                    .concat(contentSateRequest.courseId)
                    .concat(contentSateRequest.contentId)
                    .concat(contentSateRequest.batchId);
                await this.keyValueStore.getValue(key)
                    .pipe(
                        map((value: string | undefined) => {
                            if (value) {
                                const deleteQuery = `DELETE FROM ${KeyValueStoreEntry.TABLE_NAME}
                                             WHERE ${KeyValueStoreEntry.COLUMN_NAME_KEY} = '${key}' `;
                                return this.dbService.execute(deleteQuery).pipe(
                                    mapTo(true)
                                );
                            } else {
                                return of(true);
                            }
                        })
                    ).toPromise();
            }
        }
        return Promise.resolve(true);
    }


}
