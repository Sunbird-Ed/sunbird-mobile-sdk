import {LearnerAssessmentsEntry, LearnerSummaryEntry} from '../../profile/db/schema';
import {
    ContentCache,
    LearnerAssessmentDetails,
    LearnerAssessmentSummary,
    LearnerContentSummaryDetails,
    QuestionSummary,
    ReportDetailPerUser,
    UserReportSummary
} from '..';
import {NumberUtil} from '../../util/number-util';
import {CorrelationData, SunbirdTelemetry} from '../../telemetry';
import Telemetry = SunbirdTelemetry.Telemetry;

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

    public static mapDBEntriesToLearnerAssesmentSummary(assesmentsInDb: LearnerSummaryEntry.SchemaMap[],
                                                        cache: Map<string, ContentCache>): LearnerAssessmentSummary[] {
        return assesmentsInDb
            // .filter((assesment: LearnerSummaryEntry.SchemaMap) => {
            //     const contentCache: ContentCache | undefined = cache.get(assesment[LearnerSummaryEntry.COLUMN_NAME_CONTENT_ID]);
            //     return !!contentCache;
            // })
            .map((assesment: LearnerSummaryEntry.SchemaMap) => {
                const contentCache: ContentCache | undefined = cache.get(assesment[LearnerSummaryEntry.COLUMN_NAME_CONTENT_ID]);
                return {
                    uid: assesment[LearnerSummaryEntry.COLUMN_NAME_UID].toString(),
                    contentId: assesment[LearnerSummaryEntry.COLUMN_NAME_CONTENT_ID].toString(),
                    noOfQuestions: NumberUtil.parseInt(assesment[LearnerSummaryEntry.COLUMN_NAME_NO_OF_QUESTIONS]),
                    correctAnswers: NumberUtil.parseInt(assesment[LearnerSummaryEntry.COLUMN_NAME_CORRECT_ANSWERS]),
                    totalTimespent: Number(assesment[LearnerSummaryEntry.COLUMN_NAME_TOTAL_TIME_SPENT]),
                    hierarchyData: assesment[LearnerSummaryEntry.COLUMN_NAME_HIERARCHY_DATA].toString(),
                    totalMaxScore: NumberUtil.toFixed(assesment[LearnerSummaryEntry.COLUMN_NAME_TOTAL_MAX_SCORE]),
                    totalScore: NumberUtil.toFixed(assesment[LearnerSummaryEntry.COLUMN_NAME_TOTAL_SCORE]),
                    totalQuestionsScore: contentCache ? contentCache!.totalScore : 0,
                    name: contentCache ? contentCache!.name : assesment[LearnerSummaryEntry.COLUMN_NAME_CONTENT_ID],
                };
            });
    }

    public static mapDBEntriesToLearnerAssesmentDetails(assesmentDetailsInDb: LearnerAssessmentsEntry.SchemaMap[]):
        Map<string, ReportDetailPerUser> {
        const map = new Map<string, ReportDetailPerUser>();
        assesmentDetailsInDb.map((assesmentDetailInDb: LearnerAssessmentsEntry.SchemaMap) => {
            const assesmentDetails: LearnerAssessmentDetails = {
                uid: assesmentDetailInDb[LearnerAssessmentsEntry.COLUMN_NAME_UID],
                contentId: assesmentDetailInDb[LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID],
                qid: assesmentDetailInDb[LearnerAssessmentsEntry.COLUMN_NAME_QID],
                qindex: Number(assesmentDetailInDb[LearnerAssessmentsEntry.COLUMN_NAME_Q_INDEX]),
                correct: NumberUtil.parseInt(assesmentDetailInDb[LearnerAssessmentsEntry.COLUMN_NAME_CORRECT]),
                score: NumberUtil.toFixed(assesmentDetailInDb[LearnerAssessmentsEntry.COLUMN_NAME_SCORE]),
                timespent: Number(assesmentDetailInDb[LearnerAssessmentsEntry.COLUMN_NAME_TIME_SPENT]),
                res: assesmentDetailInDb[LearnerAssessmentsEntry[LearnerAssessmentsEntry.COLUMN_NAME_RES]],
                timestamp: Number(assesmentDetailInDb[LearnerAssessmentsEntry.COLUMN_NAME_TIMESTAMP]),
                qdesc: assesmentDetailInDb[LearnerAssessmentsEntry.COLUMN_NAME_Q_DESC],
                qtitle: assesmentDetailInDb[LearnerAssessmentsEntry.COLUMN_NAME_Q_TITLE],
                maxScore: NumberUtil.toFixed(assesmentDetailInDb[LearnerAssessmentsEntry.COLUMN_NAME_MAX_SCORE]),
                hierarchyData: assesmentDetailInDb[LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA],
                total_ts: Number(assesmentDetailInDb[LearnerAssessmentsEntry.COLUMN_NAME_TOTAL_TS])
            };
            let reportPerUser: ReportDetailPerUser = map.get(assesmentDetails.uid)!;
            if (reportPerUser === undefined) {
                reportPerUser = new ReportDetailPerUser();
                reportPerUser.uid = assesmentDetails.uid;
                reportPerUser.totalScore = 0;
                reportPerUser.maxTotalScore = 0;
            }
            reportPerUser.reportDetailsList.push(assesmentDetails);
            reportPerUser.totalScore += assesmentDetails.score;
            reportPerUser.totalTime = assesmentDetails.total_ts!;
            reportPerUser.maxTotalScore += assesmentDetails.maxScore;
            reportPerUser.totalScore = parseFloat(reportPerUser.totalScore.toFixed(2));
            map.set(assesmentDetails.uid, reportPerUser);
        });
        return map;
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
                score: NumberUtil.toFixed(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_SCORE]),
                timespent: Number(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_TIME_SPENT]),
                res: questionReport[LearnerAssessmentsEntry[LearnerAssessmentsEntry.COLUMN_NAME_RES]],
                timestamp: Number(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_TIMESTAMP]),
                qdesc: questionReport[LearnerAssessmentsEntry.COLUMN_NAME_Q_DESC],
                qtitle: questionReport[LearnerAssessmentsEntry.COLUMN_NAME_Q_TITLE],
                maxScore: NumberUtil.toFixed(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_MAX_SCORE]),
                hierarchyData: questionReport[LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA],
                total_ts: Number(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_TOTAL_TS]),
                marks: Number(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_MARKS]),
                occurenceCount: questionReport[LearnerAssessmentsEntry.COLUMN_NAME_COUNT],
                sum_max_score: Number(questionReport[LearnerAssessmentsEntry.COLUMN_NAME_TOTAL_MAX_SCORE]),
                correct_users_count: correctUserCount
            };
        });
    }

    public static mapDBEntriesToAccuracy(accuracyReportsInDb: LearnerAssessmentsEntry.AccuracySchema[]):
        { [key: string]: string } {
        const accuracy: { [key: string]: any } = {};
        accuracyReportsInDb.map((accuracyReport: LearnerAssessmentsEntry.AccuracySchema) => {
            accuracy[accuracyReport[LearnerAssessmentsEntry.COLUMN_NAME_QID]] =
                NumberUtil.parseInt(accuracyReport[LearnerAssessmentsEntry.COLUMN_NAME_USERS_COUNT]);
        });
        return accuracy;
    }

    public static mapDBEntriesToQuestionDetails(questionSummaries: QuestionSummary[]): QuestionSummary[] {
        return questionSummaries.map((questionSummary: QuestionSummary) => {
            return {
                uid: questionSummary.uid,
                time: Number(questionSummary.time),
                result: NumberUtil.round(questionSummary.result),
                max_score: NumberUtil.parseInt(questionSummary.max_score)
            };
        });
    }

    public static mapDBEntriesToUserReports(userReportsInDb: LearnerAssessmentsEntry.UserReportSchema[]):
        UserReportSummary[] {
        return userReportsInDb.map((assesmentDetail: LearnerAssessmentsEntry.UserReportSchema) => {
            return {
                totalTimespent: Number(assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_TOTAL_TS]),
                score: NumberUtil.toFixed(assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_SCORE]),
                hData: assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_HIERARCHY_DATA],
                contentId: assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_CONTENT_ID],
                uid: assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_UID],
                userName: assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_HANDLE],
                timespent: Number(assesmentDetail[LearnerAssessmentsEntry.COLUMN_NAME_TIME_SPENT])
            };
        });
    }

    public static mapTelemetryToContentSummaryDetails(telemetry: Telemetry): LearnerContentSummaryDetails {
        const eData = telemetry.edata;
        const question = eData.item;
        const cDataList: Array<CorrelationData> = telemetry.context.cdata;
        return {
            uid: telemetry.actor.id,
            contentId: telemetry.object.id,
            timespent: Number(eData.duration),
            timestamp: telemetry.ets,
            hierarchyData: this.getHierarchyData(cDataList)
        };

    }

    public static mapTelemetryToLearnerAssesmentDetails(telemetry: Telemetry): LearnerAssessmentDetails {
        const eData = telemetry.edata;
        const question = eData.item;
        const cDataList: Array<CorrelationData> = telemetry.context.cdata;
        return {
            uid: telemetry.actor.id,
            contentId: telemetry.object.id,
            qid: question && question.id,
            qindex: Number(eData.index),
            correct: eData.pass === 'Yes' ? 1 : 0,
            score: Number(eData.score),
            timespent: Number(eData.duration),
            timestamp: telemetry.ets,
            res: JSON.stringify(eData.resvalues),
            qdesc: question && question.desc,
            qtitle: question && question.title,
            maxScore: question && Number(question.maxscore),
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
