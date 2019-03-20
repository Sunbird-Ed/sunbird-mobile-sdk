import { ProfileEntry } from '../db/schema';
import { Profile } from '..';
export declare class ProfileDbEntryMapper {
    static mapProfileDBEntryToProfile(profileEntry: ProfileEntry.SchemaMap): Profile;
    static mapProfileToProfileDBEntry(profile: Profile): ProfileEntry.SchemaMap;
}
