import {Profile, ProfileService} from '..';
import {StorageMiddleware} from '../../db/util/storage-middleware';
import {DbService, Table} from '../../db';
import {Observable} from 'rxjs';

export class ProfileServiceImpl implements ProfileService {
    constructor(private dbService: DbService) {
    }

    createProfile(profile: Profile): Observable<Profile> {
        const saveToDb = StorageMiddleware.toDb(profile);
        this.dbService.insert({table: Table.PROFILES, modelJson: saveToDb});
        return Observable.of(profile);
    }

    deleteProfile(uid: string): Observable<number> {
        return this.dbService.delete(Table.PROFILES, 'uid =? ', [uid]);
    }
}
