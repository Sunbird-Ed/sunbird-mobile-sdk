import {DbService} from '../../../db';
import {ImportProfileContext} from '../../def/import-profile-context';
import {LearnerAssessmentsEntry, LearnerSummaryEntry, ProfileEntry} from '../../db/schema';
import {Response} from '../../../api';
import {ArrayUtil} from '../../../util/array-util';
import {SummarizerQueries} from '../../../summarizer';

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
            return this.deleteUnwantedAssesments(userIds);
        }).then(() => {
            return this.saveLearnerAssesmentDetails();
        }).then(() => {
            return this.saveLearnerSummary();
        }).then(() => {
            response.body = importContext;
            return response;
        });
    }

    private async deleteUnwantedAssesments(userIds: string[]) {
        const uidsFilter: string = ArrayUtil.joinPreservingQuotes(userIds);
        const learnerAssesmentDeleteQuery =
            `DELETE FROM ${LearnerAssessmentsEntry.TABLE_NAME}
             WHERE ${LearnerAssessmentsEntry.COLUMN_NAME_UID}  NOT IN(${uidsFilter})`;
        const learnerSummaryDeleteQuery =
            `DELETE FROM ${LearnerSummaryEntry.TABLE_NAME}
             WHERE ${LearnerSummaryEntry.COLUMN_NAME_UID}  NOT IN(${uidsFilter})`;
        await this.dbService.execute(learnerAssesmentDeleteQuery, true).toPromise();
        await this.dbService.execute(learnerSummaryDeleteQuery, true).toPromise();
    }

    private async saveLearnerAssesmentDetails() {
        const assesmentsFromExternalDb: LearnerAssessmentsEntry.SchemaMap[] = await this.dbService.read({
            table: LearnerAssessmentsEntry.TABLE_NAME,
            orderBy: `${LearnerAssessmentsEntry.COLUMN_NAME_Q_INDEX}`,
            useExternalDb: true
        }).toPromise();
        for (const element of assesmentsFromExternalDb) {
            const assesmentFromExternalDb = element as LearnerAssessmentsEntry.SchemaMap;
            const filter = SummarizerQueries.getFilterForLearnerAssessmentDetails(
                assesmentFromExternalDb[LearnerAssessmentsEntry.COLUMN_NAME_QID],
                assesmentFromExternalDb[LearnerAssessmentsEntry.COLUMN_NAME_UID],
                assesmentFromExternalDb[LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID],
                assesmentFromExternalDb[LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA]);
            const query = SummarizerQueries.getLearnerAssessmentsQuery(filter);
            const assesmentsInCurrentDb: LearnerAssessmentsEntry.SchemaMap[] = await this.dbService.execute(query).toPromise();
            if (assesmentsInCurrentDb && assesmentsInCurrentDb.length) {
                await this.dbService.update({
                    table: LearnerAssessmentsEntry.TABLE_NAME,
                    selection: `${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID} = ?
                                AND ${LearnerAssessmentsEntry.COLUMN_NAME_UID} = ?
                                AND ${LearnerAssessmentsEntry.COLUMN_NAME_QID} = ?`,
                    selectionArgs: [assesmentFromExternalDb[LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID],
                        assesmentFromExternalDb[LearnerAssessmentsEntry.COLUMN_NAME_UID],
                        assesmentFromExternalDb[LearnerAssessmentsEntry.COLUMN_NAME_QID]],
                    modelJson: assesmentFromExternalDb
                }).toPromise();
            } else {
                await this.dbService.insert({
                    table: LearnerAssessmentsEntry.TABLE_NAME,
                    modelJson: assesmentFromExternalDb
                }).toPromise();
            }
        }
    }

    private async saveLearnerSummary() {
        const summariesFromExternalDb: LearnerSummaryEntry.SchemaMap[] = await this.dbService.read({
            table: LearnerSummaryEntry.TABLE_NAME,
            useExternalDb: true
        }).toPromise();
        for (const element of summariesFromExternalDb) {
            const summaryFromExternalDb = element as LearnerSummaryEntry.SchemaMap;
            const summaryInCurrentDb: LearnerAssessmentsEntry.SchemaMap[] = await this.dbService.read({
                table: LearnerSummaryEntry.TABLE_NAME,
                selection: `${LearnerSummaryEntry.COLUMN_NAME_CONTENT_ID} = ? AND ${LearnerSummaryEntry.COLUMN_NAME_UID} = ?`,
                selectionArgs: [summaryFromExternalDb[LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID],
                    summaryFromExternalDb[LearnerAssessmentsEntry.COLUMN_NAME_UID]],
            }).toPromise();
            if (summaryInCurrentDb && summaryInCurrentDb.length) {
                await this.dbService.update({
                    table: LearnerSummaryEntry.TABLE_NAME,
                    selection: `${LearnerSummaryEntry.COLUMN_NAME_CONTENT_ID} = ? AND ${LearnerSummaryEntry.COLUMN_NAME_UID} = ?`,
                    selectionArgs: [summaryFromExternalDb[LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID],
                        summaryFromExternalDb[LearnerAssessmentsEntry.COLUMN_NAME_UID]],
                    modelJson: summaryFromExternalDb
                }).toPromise();
            } else {
                await this.dbService.insert({
                    table: LearnerSummaryEntry.TABLE_NAME,
                    modelJson: summaryFromExternalDb
                }).toPromise();
            }
        }
        summariesFromExternalDb.forEach(async (summaryFromExternalDB: LearnerSummaryEntry.SchemaMap) => {
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
