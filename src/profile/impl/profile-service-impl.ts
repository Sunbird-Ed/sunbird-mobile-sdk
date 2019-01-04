import {Profile, ProfileService} from '..';
import {ObjectMapper, StorageMiddleware} from '../../db/util/storage-middleware';
import {DbService, Table} from '../../db';
import {Observable} from 'rxjs';
import {ProfileEntry} from '../db/schema';
import {Constant} from '../def/constant';

export class ProfileServiceImpl implements ProfileService {
    constructor(private dbService: DbService) {
    }

    createProfile(profile: Profile): Observable<Profile> {
        const saveToDb = StorageMiddleware.toDb(profile);
        this.dbService.insert({
            table: Table.PROFILES,
            modelJson: ObjectMapper.map(saveToDb, {
                [Constant.BOARD]: saveToDb.board,
                [Constant.GRADE]: saveToDb.Grade,
                [Constant.HANDLE]: saveToDb.handle
            })
        });
        return Observable.of(profile);
    }

    deleteProfile(uid: string): Observable<number> {
        return this.dbService.delete(Table.PROFILES, 'uid =? ', [uid]);
    }

    updateUserInfo(profile: Profile): Observable<Profile> {
        const profileId = this.dbService.read({table: Table.PROFILES, columns: [profile.uid]});
        const saveToDb = StorageMiddleware.toDb(profile);
        if (profileId !== null) {
            return this.dbService.update({
                table: Table.PROFILES,
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
}
