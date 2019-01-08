import {Profile, ProfileService} from '..';
import {DbService, NoSqlFormatter, ObjectMapper} from '../../db';
import {Observable} from 'rxjs';
import {ProfileEntry} from '../db/schema';
import {Constant} from '../def/constant';
import {UniqueId} from '../../db/util/unique-id';
import TABLE_NAME = ProfileEntry.TABLE_NAME;

export class ProfileServiceImpl implements ProfileService {
    constructor(private dbService: DbService) {
    }

    createProfile(profile: Profile): Observable<Profile> {
        const saveToDb = NoSqlFormatter.toDb(profile);
        this.dbService.insert({
            table: TABLE_NAME,
            modelJson: ObjectMapper.map(saveToDb, {
                [Constant.BOARD]: saveToDb.board,
                [Constant.GRADE]: saveToDb.Grade,
                [Constant.HANDLE]: saveToDb.handle,
                [Constant.SYLLABUS]: saveToDb.syllabus,
                [Constant.SOURCE]: saveToDb.source,
                [Constant.MEDIUM]: saveToDb.medium,
                [Constant.PROFILE_TYPE]: saveToDb.profileType,
                [Constant.GRADE_VALUE]: saveToDb.gradeValue,
                [Constant.SUBJECT]: saveToDb.subject,
                [Constant.UID]: UniqueId.generateUniqueId(),
                [Constant.CREATED_AT]: Date.now()
            })
        });
        return Observable.of(profile);
    }

    deleteProfile(uid: string): Observable<number> {
        return this.dbService.delete(TABLE_NAME, 'uid =? ', [uid]);
    }

    updateUserInfo(profile: Profile): Observable<Profile> {
        const profileId = this.dbService.read({table: TABLE_NAME, columns: [profile.uid]});
        const saveToDb = NoSqlFormatter.toDb(profile);
        if (profileId !== null) {
            return this.dbService.update({
                table: TABLE_NAME,
                selection: `${ProfileEntry._ID} = ?`,
                selectionArgs: [profile.uid],
                modelJson: ObjectMapper.map(saveToDb, {
                    [Constant.BOARD]: saveToDb.board,
                    [Constant.GRADE]: saveToDb.Grade,
                    [Constant.HANDLE]: saveToDb.handle,
                    [Constant.SYLLABUS]: saveToDb.syllabus,
                    [Constant.SOURCE]: saveToDb.source,
                    [Constant.MEDIUM]: saveToDb.medium,
                    [Constant.PROFILE_TYPE]: saveToDb.profileType,
                    [Constant.GRADE_VALUE]: saveToDb.gradeValue,
                    [Constant.SUBJECT]: saveToDb.subject
                })
            }).map(() => {
                return profile;
            });
        }
        return Observable.of(profile);
    }
}
