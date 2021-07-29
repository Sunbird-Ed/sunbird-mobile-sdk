import { UpdateContentStateApiHandler } from './update-content-state-api-handler';
import { KeyValueStore } from '../../key-value-store';
import { DbService } from '../../db';
import { SharedPreferences } from '../../util/shared-preferences';
import { Observable } from 'rxjs';
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
