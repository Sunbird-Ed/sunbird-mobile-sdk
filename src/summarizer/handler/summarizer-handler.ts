import {LearnerAssessmentsEntry, LearnerSummaryEntry, ProfileEntry} from '../../profile/db/schema';
import {ArrayUtil} from '../../util/array-util';
import {LearnerAssessmentDetails, LearnerAssessmentSummary, QuestionSummary, UserReportSummary} from '../def/response';
import {NumberUtil} from '../../util/number-util';
import QuestionReportsSchema = LearnerAssessmentsEntry.QuestionReportsSchema;

export class SummarizerHandler {

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

    public static getContentProgressQuery(contentId: string): string {
        return `SELECT ${LearnerAssessmentsEntry.COLUMN_NAME_UID}, ${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID},
                COUNT (${LearnerAssessmentsEntry.COLUMN_NAME_QID}) AS no_of_questions,
                SUM (${LearnerAssessmentsEntry.COLUMN_NAME_CORRECT}) AS correct_answers,
                SUM (${LearnerAssessmentsEntry.COLUMN_NAME_TIME_SPENT}) AS total_time_spent, h_data ,
                SUM (${LearnerAssessmentsEntry.COLUMN_NAME_MAX_SCORE}) AS total_max_score,
                FROM  ${LearnerAssessmentsEntry.TABLE_NAME}
                WHERE ${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID} = '${contentId}'
                GROUP BY ${LearnerAssessmentsEntry.COLUMN_NAME_UID} `;
    }

    public static getDetailReportsQuery(uids: string[], contentId: string): string {
        return `SELECT *, lcs.${LearnerSummaryEntry.COLUMN_NAME_TOTAL_TS}
                FROM  ${LearnerAssessmentsEntry.TABLE_NAME} la
                LEFT JOIN ${LearnerSummaryEntry.TABLE_NAME} lcs
                ON (la.${LearnerSummaryEntry.COLUMN_NAME_UID} = lcs.${LearnerAssessmentsEntry.COLUMN_NAME_UID}
                AND la.${LearnerSummaryEntry.COLUMN_NAME_CONTENT_ID} = lcs.${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID})
                WHERE la.${LearnerAssessmentsEntry.COLUMN_NAME_UID} IN(${ArrayUtil.joinPreservingQuotes(uids)})
                AND la.${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID}='${contentId}'`;
    }

    public static getReportsByUserQuery(uids: string[], contentId: string): string {
        return `SELECT lcs.${LearnerSummaryEntry.COLUMN_NAME_TOTAL_TS},
                SUM (${LearnerAssessmentsEntry.COLUMN_NAME_SCORE}),
                la.${LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA},la.${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID},
                la.${LearnerAssessmentsEntry.COLUMN_NAME_UID},p.${ProfileEntry.COLUMN_NAME_HANDLE},
                la.${LearnerAssessmentsEntry.COLUMN_NAME_TIME_SPENT}
                FROM ${LearnerAssessmentsEntry.TABLE_NAME} la
                LEFT JOIN ${LearnerSummaryEntry.TABLE_NAME} lcs
                ON (la.${LearnerSummaryEntry.COLUMN_NAME_UID} = lcs.${LearnerAssessmentsEntry.COLUMN_NAME_UID}
                LEFT JOIN ${ProfileEntry.TABLE_NAME} p
                ON (la.${LearnerAssessmentsEntry.COLUMN_NAME_UID} = p.${ProfileEntry.COLUMN_NAME_UID}
                WHERE la.${LearnerAssessmentsEntry.COLUMN_NAME_UID} IN(${ArrayUtil.joinPreservingQuotes(uids)})
                AND la.${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID}='${contentId}'
                GROUP BY ${LearnerAssessmentsEntry.COLUMN_NAME_UID}`;
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
                COUNT (${LearnerAssessmentsEntry.COLUMN_NAME_Q_INDEX}) as count,
                SUM (${LearnerAssessmentsEntry.COLUMN_NAME_MAX_SCORE}) as  maxscore
                FROM ${LearnerAssessmentsEntry.TABLE_NAME}
                WHERE ${LearnerAssessmentsEntry.COLUMN_NAME_UID} IN(${ArrayUtil.joinPreservingQuotes(uids)})
                AND ${LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID}='${contentId}'
                GROUP BY ${LearnerAssessmentsEntry.COLUMN_NAME_QID}`;
    }

    public static mapDBEntriesToLearnerAssesmentSummary(assesmentsInDb: LearnerSummaryEntry.SchemaMap[]): LearnerAssessmentSummary[] {
        return assesmentsInDb.map((assesment: LearnerSummaryEntry.SchemaMap) => {
            return {
                uid: assesment[LearnerSummaryEntry.COLUMN_NAME_UID].toString(),
                contentId: assesment[LearnerSummaryEntry.COLUMN_NAME_CONTENT_ID].toString(),
                noOfQuestions: NumberUtil.parseInt(assesment[LearnerSummaryEntry.COLUMN_NAME_NO_OF_QUESTIONS]),
                correctAnswers: NumberUtil.parseInt(assesment[LearnerSummaryEntry.COLUMN_NAME_CORRECT_ANSWERS]),
                totalTimespent: Number(assesment[LearnerSummaryEntry.COLUMN_NAME_TOTAL_TIME_SPENT]),
                hierarchyData: assesment[LearnerSummaryEntry.COLUMN_NAME_HIERARCHY_DATA].toString(),
                totalMaxScore: NumberUtil.toPrecision(assesment[LearnerSummaryEntry.COLUMN_NAME_TOTAL_MAX_SCORE]),
                totalScore: NumberUtil.toPrecision(assesment[LearnerSummaryEntry.COLUMN_NAME_TOTAL_SCORE])
            };
        });
    }

    public static mapDBEntriesToLearnerAssesmentDetails(assesmentDetailsInDb: LearnerAssessmentsEntry.SchemaMap[]):
        LearnerAssessmentDetails[] {
        return assesmentDetailsInDb.map((assesmentDetail: LearnerAssessmentsEntry.SchemaMap) => {
            return {
                uid: assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_UID],
                contentId: assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID],
                qid: assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_QID],
                qindex: Number(assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_Q_INDEX]),
                correct: NumberUtil.parseInt(assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_CORRECT]),
                score: NumberUtil.toPrecision(assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_SCORE]),
                timespent: Number(assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_TIME_SPENT]),
                res: assesmentDetail[LearnerAssessmentsEntry[LearnerAssessmentsEntry.COLUMN_NAME_RES]],
                timestamp: Number(assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_TIMESTAMP]),
                qdesc: assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_Q_DESC],
                qtitle: assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_Q_TITLE],
                maxScore: NumberUtil.toPrecision(assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_MAX_SCORE]),
                hierarchyData: assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA],
                total_ts: Number(assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_TOTAL_TS])
            };
        });
    }

    public static mapDBEntriesToQuestionReports(accuracyMap: { [p: string]: any },
                                                questionReportsInDb: LearnerAssessmentsEntry.QuestionReportsSchema[]):
        LearnerAssessmentDetails[] {
        return questionReportsInDb.map((questionReport: LearnerAssessmentsEntry.SchemaMap) => {
            const qid = questionReport[LearnerAssessmentsEntry.COLUMN_NAME_QID];
            let correctUserCount = 0;
            if (accuracyMap.hasOwnProperty(qid)) {
                correctUserCount = NumberUtil.parseInt(accuracyMap[qid]);
            }
            return {
                uid: questionReport[LearnerAssessmentsEntry.COLUMN_NAME_UID],
                contentId: questionReport[LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID],
                qid: questionReport[LearnerAssessmentsEntry.COLUMN_NAME_QID],
                qindex: Number(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_Q_INDEX]),
                correct: NumberUtil.parseInt(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_CORRECT]),
                score: NumberUtil.toPrecision(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_SCORE]),
                timespent: Number(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_TIME_SPENT]),
                res: questionReport[LearnerAssessmentsEntry[LearnerAssessmentsEntry.COLUMN_NAME_RES]],
                timestamp: Number(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_TIMESTAMP]),
                qdesc: questionReport[LearnerAssessmentsEntry.COLUMN_NAME_Q_DESC],
                qtitle: questionReport[LearnerAssessmentsEntry.COLUMN_NAME_Q_TITLE],
                maxScore: NumberUtil.toPrecision(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_MAX_SCORE]),
                hierarchyData: questionReport[LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA],
                total_ts: Number(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_TOTAL_TS]),
                marks: Number(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_TOTAL_TS]),
                occurenceCount: Number(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_TOTAL_TS]),
                sum_max_score: Number(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_TOTAL_TS]),
                correct_users_count: correctUserCount
            };
        });
    }

    public static mapDBEntriesToAccuracy(accuracyReportsInDb: LearnerAssessmentsEntry.AccuracySchema[]):
        { [key: string]: string } {
        const accuracy: { [key: string]: any } = {};
        accuracyReportsInDb.map((accuracyReport: LearnerAssessmentsEntry.AccuracySchema) => {
            accuracy[LearnerAssessmentsEntry.COLUMN_NAME_QID] =
                NumberUtil.parseInt(accuracyReport[LearnerAssessmentsEntry.COLUMN_NAME_USERS_COUNT]);
        });
        return accuracy;
    }

    public static mapDBEntriesToQuestionDetails(questionSummaries: QuestionSummary[]): QuestionSummary[] {
        return questionSummaries.map((questionSummary: QuestionSummary) => {
            return {
                uid: questionSummary.uid,
                time: Number(questionSummary.time),
                result: NumberUtil.parseInt(questionSummary.result),
                maxScore: NumberUtil.parseInt(questionSummary.maxScore)
            };
        });
    }

    public static mapDBEntriesToUserReports(userReportsInDb: LearnerAssessmentsEntry.UserReportSchema[]):
        UserReportSummary[] {
        return userReportsInDb.map((assesmentDetail: LearnerAssessmentsEntry.UserReportSchema) => {
            return {
                totalTimespent: Number(assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_TOTAL_TS]),
                score: NumberUtil.toPrecision(assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_SCORE]),
                hData: assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA],
                contentId: assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID],
                uid: assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_UID],
                userName: assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_HANDLE],
                timespent: Number(assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_TIME_SPENT])
            };
        });
    }
}
