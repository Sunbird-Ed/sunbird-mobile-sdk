import {DbService} from '../../../db';
import {ImportProfileContext} from '../../def/import-profile-context';
import {LearnerAssessmentsEntry, LearnerSummaryEntry, ProfileEntry} from '../../db/schema';
import {Response} from '../../../api';
import {ArrayUtil} from '../../../util/array-util';
import {GroupProfileEntry} from '../../../group/db/schema';
import {SummarizerQueries} from '../../../summarizer/handler/summarizer-queries';

export class TransportAssesments {
    constructor(private dbService: DbService) {
    }

    public execute(importContext: ImportProfileContext): Promise<Response> {
        const response: Response = new Response();
        return this.dbService.read({
            table: ProfileEntry.TABLE_NAME,
            orderBy: `${ProfileEntry.COLUMN_NAME_HANDLE} asc`,
            useExternalDb: true
        }).toPromise().then((profiles: ProfileEntry.SchemaMap[]) => {
            const userIds: string[] = profiles.map((element) => {
                return element[ProfileEntry.COLUMN_NAME_UID];
            });
            return this.deleteUnwantedProfileSummary(userIds);
        }).then(() => {
            response.body = importContext;
            return response;
        });
    }

    private async deleteUnwantedProfileSummary(userIds: string[]) {
        const uidsFilter: string = ArrayUtil.joinPreservingQuotes(userIds);
        const learnerAssesmentDeleteQuery =
            `DELETE FROM ${LearnerAssessmentsEntry.TABLE_NAME}
             WHERE ${LearnerAssessmentsEntry.COLUMN_NAME_UID} = NOT IN(${uidsFilter})`;
        const learnerSummaryDeleteQuery =
            `DELETE FROM ${LearnerSummaryEntry.TABLE_NAME}
             WHERE ${LearnerSummaryEntry.COLUMN_NAME_UID} = NOT IN(${uidsFilter})`;
        await this.dbService.execute(learnerAssesmentDeleteQuery, true).toPromise();
        await this.dbService.execute(learnerSummaryDeleteQuery, true).toPromise();
    }

    private async saveLearnerAssesmentDetails() {
        const assesmentFromExternalDb: LearnerAssessmentsEntry.SchemaMap[] = await this.dbService.read({
            table: LearnerAssessmentsEntry.TABLE_NAME,
            orderBy: `${LearnerAssessmentsEntry.COLUMN_NAME_Q_INDEX}`,
            useExternalDb: true
        }).toPromise();
        assesmentFromExternalDb.forEach(async (assesmentFromExternalDB: LearnerAssessmentsEntry.SchemaMap) => {
            const filter = SummarizerQueries.getFilterForLearnerAssessmentDetails(
                assesmentFromExternalDB[LearnerAssessmentsEntry.COLUMN_NAME_QID],
                assesmentFromExternalDB[LearnerAssessmentsEntry.COLUMN_NAME_UID],
                assesmentFromExternalDB[LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID],
                assesmentFromExternalDB[LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA]);
            const query = SummarizerQueries.getLearnerAssessmentsQuery(filter);
            const assesmentsInCurrentDb: LearnerAssessmentsEntry.SchemaMap[] = await this.dbService.execute(query).toPromise();
            if (assesmentsInCurrentDb && assesmentsInCurrentDb.length) {
                await this.dbService.update({
                    table: LearnerAssessmentsEntry.TABLE_NAME,
                    modelJson: assesmentsInCurrentDb[0]
                }).toPromise();
            } else {
                await this.dbService.insert({
                    table: LearnerAssessmentsEntry.TABLE_NAME,
                    modelJson: assesmentsInCurrentDb[0]
                }).toPromise();
            }
        });
    }

    private async saveLearnerSummary() {
        const assesmentFromExternalDb: LearnerSummaryEntry.SchemaMap[] = await this.dbService.read({
            table: LearnerSummaryEntry.TABLE_NAME,
            useExternalDb: true
        }).toPromise();
        assesmentFromExternalDb.forEach(async (summaryFromExternalDB: LearnerSummaryEntry.SchemaMap) => {
            const filter = SummarizerQueries.getFilterForLearnerAssessmentDetails(
                summaryFromExternalDB[LearnerAssessmentsEntry.COLUMN_NAME_QID],
                summaryFromExternalDB[LearnerAssessmentsEntry.COLUMN_NAME_UID],
                summaryFromExternalDB[LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID],
                summaryFromExternalDB[LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA]);
            const query = SummarizerQueries.getLearnerAssessmentsQuery(filter);
            const assesmentsInCurrentDb: LearnerAssessmentsEntry.SchemaMap[] = await this.dbService.execute(query).toPromise();
            if (assesmentsInCurrentDb && assesmentsInCurrentDb.length) {
                await this.dbService.update({
                    table: LearnerSummaryEntry.TABLE_NAME,
                    modelJson: assesmentsInCurrentDb[0]
                }).toPromise();
            } else {
                await this.dbService.insert({
                    table: LearnerSummaryEntry.TABLE_NAME,
                    modelJson: assesmentsInCurrentDb[0]
                }).toPromise();
            }
        });
    }

}
