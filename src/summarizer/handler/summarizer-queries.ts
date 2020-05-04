import {LearnerAssessmentsEntry, LearnerSummaryEntry, ProfileEntry} from '../../profile/db/schema';
import {ArrayUtil} from '../../util/array-util';

export class SummarizerQueries {
    public static getChildProgressQuery(uids: string[]): string {
        return `SELECT ${LearnerAssessmentsEntry.COLUMN_NAME_UID}, ${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID},
                COUNT (${LearnerAssessmentsEntry.COLUMN_NAME_QID}) AS no_of_questions,
                SUM (${LearnerAssessmentsEntry.COLUMN_NAME_CORRECT}) AS correct_answers,
                SUM (${LearnerAssessmentsEntry.COLUMN_NAME_TIME_SPENT}) AS total_time_spent, h_data ,
                SUM (${LearnerAssessmentsEntry.COLUMN_NAME_MAX_SCORE}) AS total_max_score,
                SUM (${LearnerAssessmentsEntry.COLUMN_NAME_SCORE}) AS total_score
                FROM  ${LearnerAssessmentsEntry.TABLE_NAME}
                WHERE ${LearnerAssessmentsEntry.COLUMN_NAME_UID} IN (${ArrayUtil.joinPreservingQuotes(uids)})
                GROUP BY ${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID} `;
    }

    public static getDetailReportsQuery(uids: string[], contentId: string): string {
        return `SELECT *, lcs.${LearnerSummaryEntry.COLUMN_NAME_TOTAL_TS}
                FROM  ${LearnerAssessmentsEntry.TABLE_NAME} la
                LEFT JOIN ${LearnerSummaryEntry.TABLE_NAME} lcs
                ON (la.${LearnerSummaryEntry.COLUMN_NAME_UID} = lcs.${LearnerAssessmentsEntry.COLUMN_NAME_UID})
                AND la.${LearnerSummaryEntry.COLUMN_NAME_CONTENT_ID} = lcs.${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID}
                WHERE la.${LearnerAssessmentsEntry.COLUMN_NAME_UID} IN(${ArrayUtil.joinPreservingQuotes(uids)})
                AND la.${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID}='${contentId}'`;
    }

    public static getReportsByUserQuery(uids: string[], contentId: string): string {
        return `SELECT lcs.${LearnerSummaryEntry.COLUMN_NAME_TOTAL_TS},
                SUM (${LearnerAssessmentsEntry.COLUMN_NAME_SCORE}) AS score,
                la.${LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA},la.${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID},
                la.${LearnerAssessmentsEntry.COLUMN_NAME_UID},p.${ProfileEntry.COLUMN_NAME_HANDLE},
                la.${LearnerAssessmentsEntry.COLUMN_NAME_TIME_SPENT}
                FROM ${LearnerAssessmentsEntry.TABLE_NAME} la
                LEFT JOIN ${LearnerSummaryEntry.TABLE_NAME} lcs
                ON (la.${LearnerSummaryEntry.COLUMN_NAME_UID} = lcs.${LearnerAssessmentsEntry.COLUMN_NAME_UID})
                LEFT JOIN ${ProfileEntry.TABLE_NAME} p
                ON (la.${LearnerAssessmentsEntry.COLUMN_NAME_UID} = p.${ProfileEntry.COLUMN_NAME_UID})
                WHERE la.${LearnerAssessmentsEntry.COLUMN_NAME_UID} IN(${ArrayUtil.joinPreservingQuotes(uids)})
                AND la.${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID}='${contentId}'
                GROUP BY la.${LearnerAssessmentsEntry.COLUMN_NAME_UID}`;
    }

    public static getQuetsionDetailsQuery(uids: string[], contentId: string, qid: string): string {
        return `SELECT ${LearnerAssessmentsEntry.COLUMN_NAME_UID}, ${LearnerAssessmentsEntry.COLUMN_NAME_TIME_SPENT} as time,
                ${LearnerAssessmentsEntry.COLUMN_NAME_SCORE} as result,
                ${LearnerAssessmentsEntry.COLUMN_NAME_MAX_SCORE} as max_score
                FROM ${LearnerAssessmentsEntry.TABLE_NAME}
                WHERE ${LearnerAssessmentsEntry.COLUMN_NAME_UID} IN(${ArrayUtil.joinPreservingQuotes(uids)})
                AND ${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID}='${contentId}'
                AND ${LearnerAssessmentsEntry.COLUMN_NAME_QID}='${qid}'`;
    }

    public static getReportAccuracyQuery(uids: string[], contentId: string): string {
        return `SELECT ${LearnerAssessmentsEntry.COLUMN_NAME_QID}, COUNT (*) as users_count
                FROM  ${LearnerAssessmentsEntry.TABLE_NAME}
                WHERE ${LearnerAssessmentsEntry.COLUMN_NAME_UID} IN(${ArrayUtil.joinPreservingQuotes(uids)})
                AND ${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID}='${contentId}'
                AND ${LearnerAssessmentsEntry.COLUMN_NAME_SCORE} > 0
                GROUP BY ${LearnerAssessmentsEntry.COLUMN_NAME_QID}`;
    }

    public static getQuestionReportsQuery(uids: string[], contentId: string): string {
        return `SELECT *, SUM(${LearnerAssessmentsEntry.COLUMN_NAME_SCORE}) as marks,
                COUNT (${LearnerAssessmentsEntry.COLUMN_NAME_Q_INDEX}) as occurence_count,
                SUM (${LearnerAssessmentsEntry.COLUMN_NAME_MAX_SCORE}) as  sum_max_score
                FROM ${LearnerAssessmentsEntry.TABLE_NAME}
                WHERE ${LearnerAssessmentsEntry.COLUMN_NAME_UID} IN(${ArrayUtil.joinPreservingQuotes(uids)})
                AND ${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID}='${contentId}'
                GROUP BY ${LearnerAssessmentsEntry.COLUMN_NAME_QID}`;
    }

    public static getFilterForLearnerAssessmentDetails(qid: string, uid: string, contentId: string, hierarchyData: string): string {
        const qidFilter = `${LearnerAssessmentsEntry.COLUMN_NAME_QID} = '${qid}'`;
        const uidFilter = `${LearnerAssessmentsEntry.COLUMN_NAME_UID} = '${uid}'`;
        const contentIdFilter = `${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID} = '${contentId}'`;
        const hDataFilter = `${LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA} = '${hierarchyData ? hierarchyData : ''}'`;
        const filter = `WHERE ${uidFilter} AND ${contentIdFilter} AND ${hDataFilter} ${qid ? ` AND ${qidFilter}` : ''}`;
        return filter;
    }

    public static getLearnerAssessmentsQuery(filter: string) {
        const query = `SELECT * from ${LearnerAssessmentsEntry.TABLE_NAME} ${filter}
                       ORDER BY ${LearnerAssessmentsEntry.COLUMN_NAME_Q_INDEX}`;
        return query;
    }

    public static getUpdateSelection() {
        const query = `${LearnerAssessmentsEntry.COLUMN_NAME_UID} = ? AND ` +
                       `${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID} = ? AND ` +
                       `${LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA} = ? AND ` +
                       `${LearnerAssessmentsEntry.COLUMN_NAME_QID} = ? `;
        return query;
    }

    public static getLearnerSummaryReadSelection(hData: string) {
        const query = `${LearnerAssessmentsEntry.COLUMN_NAME_UID} = ? AND ` +
                       `${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID} = ? AND ` +
                       `${LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA} = ? `;
        return query;
    }

}
