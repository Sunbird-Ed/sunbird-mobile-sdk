import { Observable } from 'rxjs';
import { FileService } from '../../util/file/def/file-service';
import { TransferContentContext } from './transfer-content-handler';
import { DbService } from '../../db';
import { AppConfig } from '../../api/config/app-config';
import { DeviceInfo } from '../../util/device';
export declare class StoreDestinationContentInDb {
    private appConfig;
    private fileService;
    private dbService;
    private deviceInfo;
    static MANIFEST_FILE_NAME: string;
    constructor(appConfig: AppConfig, fileService: FileService, dbService: DbService, deviceInfo: DeviceInfo);
    execute(context: TransferContentContext): Observable<void>;
    private getNewlyAddedContents;
    private addDestinationContentInDb;
    private extractContentFromItem;
    private constructContentDBModel;
    private getReferenceCount;
    /**
     * add or update the reference count for the content
     *
     */
    private getContentVisibility;
    /**
     * Add or update the content_state. contentState should not update the spine_only when importing the spine content
     * after importing content with artifacts.
     *
     */
    private getContentState;
}
