import { Response } from '../../../api';
import { DbService } from '../../../db';
import { ExportProfileContext } from '../../def/export-profile-context';
export declare class CopyDatabase {
    private dbService;
    constructor(dbService: DbService);
    execute(exportContext: ExportProfileContext): Promise<Response>;
}
