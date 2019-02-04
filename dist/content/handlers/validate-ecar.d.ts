import { ImportContentContext } from '..';
import { Response } from '../../api';
import { FileService } from '../../util/file/def/file-service';
import { AppConfig } from '../../api/config/app-config';
import { DbService } from '../../db';
export declare class ValidateEcar {
    private fileService;
    private dbService;
    private readonly MANIFEST_FILE_NAME;
    constructor(fileService: FileService, dbService: DbService);
    execute(tempLocationPath: string, importContext: ImportContentContext, appConfig: AppConfig): Promise<Response>;
    /**
     * Skip the content.
     */
    private skipContent;
}
