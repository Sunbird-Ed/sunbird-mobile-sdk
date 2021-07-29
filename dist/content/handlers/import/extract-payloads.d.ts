import { ImportContentContext } from '../..';
import { SharedPreferences } from '../../../util/shared-preferences';
import { Response } from '../../../api';
import { FileService } from '../../../util/file/def/file-service';
import { DbService } from '../../../db';
import { GetContentDetailsHandler } from '../get-content-details-handler';
import { ZipService } from '../../../util/zip/def/zip-service';
import { AppConfig } from '../../../api/config/app-config';
import { DeviceInfo } from '../../../util/device';
import { EventsBusService } from '../../../events-bus';
export declare class ExtractPayloads {
    private fileService;
    private zipService;
    private appConfig;
    private dbService;
    private deviceInfo;
    private getContentDetailsHandler;
    private eventsBusService;
    private sharedPreferences;
    constructor(fileService: FileService, zipService: ZipService, appConfig: AppConfig, dbService: DbService, deviceInfo: DeviceInfo, getContentDetailsHandler: GetContentDetailsHandler, eventsBusService: EventsBusService, sharedPreferences: SharedPreferences);
    execute(importContext: ImportContentContext): Promise<Response>;
    updateContentFileSizeInDB(importContext: ImportContentContext, commonContentModelsMap: any, payloadDestinationPathMap: any, result: any): Promise<void>;
    updateContentDB(insertNewContentModels: any, updateNewContentModels: any, updateSize?: boolean): Promise<void>;
    copyAssets(tempLocationPath: string, asset: string, payloadDestinationPath: string, useSubDirectories?: boolean): Promise<void>;
    /**
     * add or update the reference count for the content
     *
     */
    getContentVisibility(existingContentInDb: any, objectType: any, isChildContent: boolean, previousVisibility: string): string;
    /**
     * Add or update the content_state. contentState should not update the spine_only when importing the spine content
     * after importing content with artifacts.
     *
     */
    getContentState(existingContentInDb: any, contentState: number): number;
    getBasePath(payLoadDestinationPath: any, doesContentExist: boolean, existingContentPath: string): string;
    /**
     * add or update the reference count for the content
     *
     */
    private getReferenceCount;
    private postImportProgressEvent;
    private constructContentDBModel;
    private createDirectories;
}
