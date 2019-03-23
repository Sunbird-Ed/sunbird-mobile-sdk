import { UpdateContentStateHandler } from './update-content-state-handler';
import { DbService } from '../../db';
import { Observable } from 'rxjs';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class ContentStatesHandler {
    private updateContentStateHandler;
    private dbService;
    private sharedPreferences;
    constructor(updateContentStateHandler: UpdateContentStateHandler, dbService: DbService, sharedPreferences: SharedPreferences);
    updateContentState(): Observable<boolean>;
    private prepareContentStateRequest;
    private invokeContentStateAPI;
}
