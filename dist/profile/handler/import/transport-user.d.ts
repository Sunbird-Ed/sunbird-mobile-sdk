import { DbService } from '../../../db';
import { ImportProfileContext } from '../../def/import-profile-context';
import { Response } from '../../../api';
export declare class TransportUser {
    private dbService;
    constructor(dbService: DbService);
    execute(importContext: ImportProfileContext): Promise<Response>;
    private saveUsersToDb;
}
