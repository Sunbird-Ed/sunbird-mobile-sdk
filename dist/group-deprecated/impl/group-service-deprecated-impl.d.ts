import { DbService } from '../../db';
import { GetAllGroupRequestDeprecated, GroupDeprecated, GroupServiceDeprecated, GroupSessionDeprecated, ProfilesToGroupRequestDeprecated } from '..';
import { ProfileService } from '../../profile';
import { SharedPreferences } from '../../util/shared-preferences';
import { Container } from 'inversify';
import { Observable } from 'rxjs';
export declare class GroupServiceDeprecatedImpl implements GroupServiceDeprecated {
    private container;
    private dbService;
    private profileService;
    private sharedPreferences;
    private static readonly KEY_GROUP_SESSION;
    constructor(container: Container, dbService: DbService, profileService: ProfileService, sharedPreferences: SharedPreferences);
    private readonly telemetryService;
    createGroup(group: GroupDeprecated): Observable<GroupDeprecated>;
    deleteGroup(gid: string): Observable<undefined>;
    updateGroup(group: GroupDeprecated): Observable<GroupDeprecated>;
    getActiveSessionGroup(): Observable<GroupDeprecated>;
    setActiveSessionForGroup(gid: string): Observable<boolean>;
    getActiveGroupSession(): Observable<GroupSessionDeprecated | undefined>;
    getAllGroups(groupRequest?: GetAllGroupRequestDeprecated): Observable<GroupDeprecated[]>;
    addProfilesToGroup(profileToGroupRequest: ProfilesToGroupRequestDeprecated): Observable<number>;
    removeActiveGroupSession(): Observable<undefined>;
}
