import { FileService } from '../../../util/file/def/file-service';
import { ImportContentContext } from '../..';
import { Response } from '../../../api';
export declare class EcarCleanup {
    private fileService;
    constructor(fileService: FileService);
    execute(importContentContext: ImportContentContext): Promise<Response>;
}
