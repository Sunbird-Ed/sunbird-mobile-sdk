import { UpdateContentStateApiHandler } from './update-content-state-api-handler';
import { KeyValueStore } from '../../key-value-store';
import { DbService } from '../../db';
import { Observable } from 'rxjs';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class ContentStatesSyncHandler {
    private updateContentStateHandler;
    private dbService;
    private sharedPreferences;
    private keyValueStore;
    constructor(updateContentStateHandler: UpdateContentStateApiHandler, dbService: DbService, sharedPreferences: SharedPreferences, keyValueStore: KeyValueStore);
    updateContentState(): Observable<boolean>;
    private prepareContentStateRequest;
    private invokeContentStateAPI;
    private deleteContentState;
}
