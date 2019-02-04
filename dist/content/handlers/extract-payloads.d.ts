import { FileService } from '../../util/file/def/file-service';
import { DbService } from '../../db';
import { ZipService } from '../../util/zip/def/zip-service';
import { AppConfig } from '../../api/config/app-config';
export declare class ExtractPayloads {
    private fileService;
    private zipService;
    private appConfig;
    private dbService;
    constructor(fileService: FileService, zipService: ZipService, appConfig: AppConfig, dbService: DbService);
    private createInserQuery;
    copyAssets(tempLocationPath: string, asset: string, payloadDestinationPath: string): Promise<void>;
    /**
     * add or update the reference count for the content
     *
     */
    getReferenceCount(existingContent: any, visibility: string, isChildContent: boolean): number;
    /**
     * add or update the reference count for the content
     *
     */
    getContentVisibility(existingContentInDb: any, objectType: any, isChildContent: boolean): string;
    /**
     * Add or update the content_state. contentState should not update the spine_only when importing the spine content
     * after importing content with artifacts.
     *
     */
    getContentState(existingContentInDb: any, contentState: number): number;
    getBasePath(payLoadDestinationPath: any, doesContentExist: boolean, existingContentPath: string): string;
}
