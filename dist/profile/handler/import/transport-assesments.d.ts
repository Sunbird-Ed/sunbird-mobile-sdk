import { DbService } from '../../../db';
import { ImportProfileContext } from '../../def/import-profile-context';
import { Response } from '../../../api';
export declare class TransportAssesments {
    private dbService;
    constructor(dbService: DbService);
    execute(importContext: ImportProfileContext): Promise<Response>;
    private deleteUnwantedAssesments;
    private saveLearnerAssesmentDetails;
    private saveLearnerSummary;
}
