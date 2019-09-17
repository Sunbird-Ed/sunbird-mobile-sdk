import { FileService } from '../../../util/file/def/file-service';
import { ImportContentContext } from '../..';
import { Response } from '../../../api';
import { DbService } from '../../../db';
export declare class CreateHierarchy {
    private dbService;
    private fileService;
    private readonly HIERARCHY_FILE_NAME;
    private contentMap;
    constructor(dbService: DbService, fileService: FileService);
    execute(importContentContext: ImportContentContext): Promise<Response>;
    /**
     * fetchChildrenOfContent()
     * @param content
     */
    private createTextBookHierarchy;
    private getSortedChildrenList;
}
