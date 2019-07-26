import { ImportContentContext } from '../..';
import { Response } from '../../../api';
import { FileService } from '../../../util/file/def/file-service';
import { AppConfig } from '../../../api/config/app-config';
import { DbService } from '../../../db';
import { GetContentDetailsHandler } from '../get-content-details-handler';
export declare class ValidateEcar {
    private fileService;
    private dbService;
    private appConfig;
    private getContentDetailsHandler;
    constructor(fileService: FileService, dbService: DbService, appConfig: AppConfig, getContentDetailsHandler: GetContentDetailsHandler);
    execute(importContext: ImportContentContext): Promise<Response>;
    /**
     * Skip the content.
     */
    private skipContent;
}
