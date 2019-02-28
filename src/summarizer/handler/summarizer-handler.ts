import {LearnerAssessmentsEntry, LearnerSummaryEntry, ProfileEntry} from '../../profile/db/schema';
import {ArrayUtil} from '../../util/array-util';
import {
    LearnerAssessmentDetails,
    LearnerAssessmentSummary,
    LearnerContentSummaryDetails,
    QuestionSummary,
    UserReportSummary
} from '../def/response';
import {NumberUtil} from '../../util/number-util';
import QuestionReportsSchema = LearnerAssessmentsEntry.QuestionReportsSchema;
import {Context, CorrelationData, TelemetryEvents} from '../../telemetry';
import Telemetry = TelemetryEvents.Telemetry;

export class SummarizerHandler {
    constructor() {
    }

    public static mapLearnerAssesmentDetailsToDbEntries(learnerAssessmentDetails: LearnerAssessmentDetails):
        LearnerAssessmentsEntry.SchemaMap {
        return {
            [LearnerAssessmentsEntry.COLUMN_NAME_UID]: learnerAssessmentDetails.uid,
            [LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID]: learnerAssessmentDetails.contentId,
            [LearnerAssessmentsEntry.COLUMN_NAME_QID]: learnerAssessmentDetails.qid,
            [LearnerAssessmentsEntry.COLUMN_NAME_Q_INDEX]: learnerAssessmentDetails.qindex,
            [LearnerAssessmentsEntry.COLUMN_NAME_CORRECT]: learnerAssessmentDetails.correct,
            [LearnerAssessmentsEntry.COLUMN_NAME_SCORE]: learnerAssessmentDetails.score,
            [LearnerAssessmentsEntry.COLUMN_NAME_TIME_SPENT]: learnerAssessmentDetails.timespent,
            [LearnerAssessmentsEntry.COLUMN_NAME_RES]: learnerAssessmentDetails.res,
            [LearnerAssessmentsEntry.COLUMN_NAME_TIMESTAMP]: learnerAssessmentDetails.timestamp,
            [LearnerAssessmentsEntry.COLUMN_NAME_Q_DESC]: learnerAssessmentDetails.qdesc,
            [LearnerAssessmentsEntry.COLUMN_NAME_Q_TITLE]: learnerAssessmentDetails.qtitle,
            [LearnerAssessmentsEntry.COLUMN_NAME_MAX_SCORE]: learnerAssessmentDetails.maxScore,
            [LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA]: learnerAssessmentDetails.hierarchyData,
            [LearnerAssessmentsEntry.COLUMN_NAME_TOTAL_TS]: learnerAssessmentDetails.total_ts!
        };
    }

    public static mapContentSummaryDetailsToDbEntries(learnerContentSummaryDetails: LearnerContentSummaryDetails):
        LearnerSummaryEntry.SchemaMap {
        return {
            [LearnerSummaryEntry.COLUMN_NAME_UID]: learnerContentSummaryDetails.uid,
            [LearnerSummaryEntry.COLUMN_NAME_CONTENT_ID]: learnerContentSummaryDetails.contentId,
            [LearnerSummaryEntry.COLUMN_NAME_AVG_TS]: learnerContentSummaryDetails.avgts!,
            [LearnerSummaryEntry.COLUMN_NAME_TOTAL_TS]: learnerContentSummaryDetails.totalts!,
            [LearnerSummaryEntry.COLUMN_NAME_LAST_UPDATED_ON]: learnerContentSummaryDetails.lastUpdated!,
            [LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA]: learnerContentSummaryDetails.hierarchyData,
        };
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

    public static mapTelemetryToContentSummaryDetails(telemetry: Telemetry): LearnerContentSummaryDetails {
        const eData = telemetry.getEData();
        const question = eData.item;
        const cDataList: Array<CorrelationData> = telemetry.getContext().getCData();
        return {
            uid: telemetry.getActor().id,
            contentId: telemetry.getObject().id,
            timespent: Number(eData.duration),
            timestamp: telemetry.getTimeStamp(),
            hierarchyData: this.getHierarchyData(cDataList)
        };

    }

    public static mapTelemetryToLearnerAssesmentDetails(telemetry: Telemetry): LearnerAssessmentDetails {
        const eData = telemetry.getEData();
        const question = eData.item;
        const cDataList: Array<CorrelationData> = telemetry.getContext().getCData();
        return {
            uid: telemetry.getActor().id,
            contentId: telemetry.getObject().id,
            qid: question.id,
            qindex: Number(eData.index),
            correct: eData.pass === 'Yes' ? 1 : 0,
            score: Number(eData.score),
            timespent: Number(eData.duration),
            timestamp: telemetry.getTimeStamp(),
            res: JSON.stringify(eData.resvalues),
            qdesc: question.desc,
            qtitle: question.title,
            maxScore: Number(question.maxscore),
            hierarchyData: this.getHierarchyData(cDataList)
        };

    }


    private static getHierarchyData(cDataList: Array<CorrelationData>): string {
        let hierarchyData = '';
        if (cDataList) {
            cDataList.forEach((cData) => {
                if (cData.type === 'Collection' || cData.type === 'TextBook') {
                    return hierarchyData = cData.id;
                }
            });
        }
        return '';
    }

}
