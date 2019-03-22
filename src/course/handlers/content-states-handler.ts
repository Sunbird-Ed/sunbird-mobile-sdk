import {ContentState, CourseServiceImpl, UpdateContentStateAPIRequest, UpdateContentStateRequest} from '..';
import {UpdateContentStateHandler} from './update-content-state-handler';
import {CourseUtil} from '../course-util';
import {KeyValueStore} from '../../key-value-store';
import {KeyValueStoreEntry} from '../../key-value-store/db/schema';
import {DbService} from '../../db';
import {Observable} from 'rxjs';
import {SharedPreferences} from '../../util/shared-preferences';
import {ContentKeys} from '../../preference-keys';

export class ContentStatesHandler {

    constructor(private updateContentStateHandler: UpdateContentStateHandler,
                private dbService: DbService,
                private sharedPreferences: SharedPreferences) {

    }

    public updateContentState(): Observable<boolean> {
        return this.sharedPreferences.getBoolean(ContentKeys.UPDATE_CONTENT_STATE).mergeMap((value: boolean) => {
            if (value) {
                return this.prepareContentStateRequest()
                    .mergeMap((updateContentRequestMap: { [key: string]: UpdateContentStateRequest[] }) => {
                        return Observable.fromPromise(this.invokeContentStateAPI(updateContentRequestMap))
                            .mapTo(true);
                    });
            } else {
                return Observable.of(false);
            }
        });
    }


    private prepareContentStateRequest(): Observable<{ [key: string]: UpdateContentStateRequest[] }> {
        const query = `SELECT * FROM ${KeyValueStoreEntry.TABLE_NAME}
                           WHERE ${KeyValueStoreEntry.COLUMN_NAME_KEY}
                           LIKE '%%${CourseServiceImpl.UPDATE_CONTENT_STATE_KEY_PREFIX}%%'`;
        return this.dbService.execute(query).map((keyValueEntries: KeyValueStoreEntry.SchemaMap[]) => {
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
        });

    }


    private async invokeContentStateAPI(userContentStateMap: { [key: string]: UpdateContentStateRequest[] }): Promise<boolean> {

        for (const userId of Object.keys(userContentStateMap)) {
            const status = await this.updateContentStateHandler.handle(CourseUtil.getUpdateContentStateListRequest(
                userId, userContentStateMap[userId]));
            if (!status) {
                continue;
            }
        }
        return Promise.resolve(true);
    }

}
