import {Profile, ProfileService} from '..';
import {DbService, NoSqlFormatter, ObjectMapper} from '../../db';
import {Observable} from 'rxjs';
import {ProfileEntry} from '../db/schema';
import {Constant} from '../def/constant';
import {UsersSearchCriteria} from '../def/users-search-criteria';
import {User} from '../def/user';
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
                [Constant.HANDLE]: saveToDb.handle
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
                    [Constant.HANDLE]: saveToDb.handle
                })
            }).map(() => {
                return profile;
            });
        }
        return Observable.of(profile);
    }

    getUsers(searchCriteria: UsersSearchCriteria): Observable<User[]> {
        // TODO
        return Observable.from([]);
    }
}
