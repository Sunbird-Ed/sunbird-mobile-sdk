import { ProfileEntry } from '../db/schema';
import { Profile } from '..';
export declare class ProfileMapper {
    static mapProfileDBEntryToProfile(profileEntry: ProfileEntry.SchemaMap): Profile;
    static mapProfileToProfileDBEntry(profile: Profile): ProfileEntry.SchemaMap;
}
