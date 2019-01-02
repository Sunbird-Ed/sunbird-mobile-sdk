import {Profile, ProfileService} from '..';
import {StorageMiddleware} from '../../db/utility/db-to-object/storage-middleware';
import {DbSdk, Service, Table} from '../../db';

export class ProfileServiceImpl implements ProfileService {
    private dbService: Service;

    constructor() {
        this.dbService = DbSdk.instance.getService();
    }

    async createProfile(profile: Profile): Promise<Profile> {
        const saveToDb = StorageMiddleware.toDb(profile);
        await this.dbService.insert({table: Table.PROFILES, modelJson: saveToDb});
        return profile;
    }

    async deleteProfile(uid: string): Promise<number> {
        return this.dbService.delete(Table.PROFILES, 'uid =? ', [uid]);
    }
}
