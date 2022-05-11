import {KeyValueStore} from '../../key-value-store';
import {SunbirdTelemetry} from '../../telemetry';
import {CourseServiceImpl} from './course-service-impl';
import {ContentStateResponse} from '../def/request-types';
import {ContentState, ContentStateScore} from '@project-sunbird/client-services/services/course';
import { Observable } from 'rxjs';
import {ContentKeys} from '../../preference-keys';
import { map } from 'rxjs/operators';
import {SharedPreferences} from '../../util/shared-preferences';

export class OfflineAssessmentScoreProcessor {
    constructor(
        private keyValueStore: KeyValueStore,
        private sharedPreference: SharedPreferences
    ) {
    }

    async process(
        capturedAssessments: { [key: string]: SunbirdTelemetry.Telemetry[] | undefined }
    ) {
        const context = await this.getCourseContext().toPromise();
        const BATCH_IN_PROGRESS = 1;
        if (context.batchStatus === BATCH_IN_PROGRESS) {
            for (const k of Object.keys(capturedAssessments)) {
                const courseContext = JSON.parse(k);
                const events = capturedAssessments[k];
                if (!events) {
                    continue;
                }
                const key = CourseServiceImpl.GET_CONTENT_STATE_KEY_PREFIX.concat(courseContext.userId, courseContext.courseId);
                const contentStateString = await this.keyValueStore.getValue(key).toPromise();
                const contentState: ContentStateResponse = (() => {
                    // if already in db
                    if (contentStateString) {
                        return JSON.parse(contentStateString);
                    }
                    return {contentList: []};
                })();
                const contentScores: { [contentId: string]: ContentStateScore } = events.reduce((acc, event: any) => {
                    try {
                        const attemptId = event.context.cdata.find((c) => c.type === 'AttemptId').id;
                        const contentId = event.object.id;
                        const maxScore = event.edata.item.maxscore;
                        const score = event.edata.score;
                        if (acc[contentId]) {
                            const contentStateScore: ContentStateScore = (acc[contentId] as ContentStateScore);
                            contentStateScore.attemptId = attemptId;
                            contentStateScore.lastAttemptedOn = Date.now() + '';
                            contentStateScore.totalMaxScore += maxScore;
                            contentStateScore.totalScore += score;
                        } else {
                            acc[contentId] = {
                                attemptId: attemptId,
                                lastAttemptedOn: Date.now() + '',
                                totalMaxScore: maxScore,
                                totalScore: score,
                            };
                        }
                        if (!contentState.contentList.find(c => c.contentId === contentId)) {
                            contentState.contentList.push({
                                'lastAccessTime': '2021-01-14 07:09:32:602+0000',
                                'contentId': contentId,
                                'progress': 100,
                                'batchId': courseContext.batchId,
                                'courseId': courseContext.courseId,
                                'collectionId': courseContext.courseId,
                                'lastCompletedTime': '2021-01-14 07:09:32:810+0000',
                                'status': 2,
                            });
                        }
                    } catch (e) {
                        console.error(e);
                    }
                    return acc;
                }, {});
                contentState.contentList = contentState.contentList.map((c: ContentState) => {
                    // no attempts made previously
                    if (!c.score || !c.score.length) {
                        c.score = contentScores[c.contentId!] ? [contentScores[c.contentId!]] : [];
                        c.bestScore = c.score.reduce<ContentStateScore | undefined>
                        ((acc: ContentStateScore | undefined, score: ContentStateScore) => {
                            if (!acc) {
                                return score;
                            }
                            if (acc.totalScore < score.totalScore) {
                                return score;
                            }
                            return acc;
                        }, undefined);
                        return c;
                    }
                    // append attempt
                    if (contentScores[c.contentId!]) {
                        c.score.push(contentScores[c.contentId!]);
                        if (c.bestScore && (c.bestScore!.totalScore < contentScores[c.contentId!].totalScore)) {
                            c.bestScore = contentScores[c.contentId!];
                        }
                        return c;
                    }
                    return c;
                });
                console.log(contentState);
                // store back
                await this.keyValueStore.setValue(key, JSON.stringify(contentState)).toPromise();
            }
        }
    }
    private getCourseContext(): Observable<any> {
        return this.sharedPreference.getString(ContentKeys.COURSE_CONTEXT).pipe(
            map((value: string | undefined) => {
                return value ? JSON.parse(value) : {};
            })
        );
    }
}
