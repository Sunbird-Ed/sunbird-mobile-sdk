import {DbService} from '../../db';
import {Observable} from 'rxjs';
import {GroupEntry, GroupProfileEntry} from '../db/schema';
import {
    GetAllGroupRequest,
    Group,
    GroupService,
    GroupSession,
    NoActiveGroupSessionError,
    NoGroupFoundError,
    ProfilesToGroupRequest
} from '..';
import {GroupMapper} from '../util/group-mapper';
import {UniqueId} from '../../db/util/unique-id';
import {KeyValueStore} from '../../key-value-store';
import {ProfileService, ProfileSession} from '../../profile';
import {SharedPreferences} from '../../util/shared-preferences';
import {GroupKeys} from '../../preference-keys';
import {Actor, AuditState, ObjectType, TelemetryAuditRequest, TelemetryService} from '../../telemetry';
import {ObjectUtil} from '../../util/object-util';


export class GroupServiceImpl implements GroupService {
    private static readonly KEY_GROUP_SESSION = GroupKeys.KEY_GROUP_SESSION;
    private telemetryService: TelemetryService;

    constructor(private dbService: DbService,
                private profileService: ProfileService,
                private keyValueStore: KeyValueStore,
                private sharedPreferences: SharedPreferences) {
    }

    public registerTelemetryService(telemetryService: TelemetryService) {
        this.telemetryService = telemetryService;
    }

    createGroup(group: Group): Observable<Group> {
        group.gid = UniqueId.generateUniqueId();
        group.createdAt = Date.now();
        group.updatedAt = Date.now();

        return this.dbService.insert({
            table: GroupEntry.TABLE_NAME,
            modelJson: GroupMapper.mapGroupToGroupDBEntry(group)
        }).do(async () => {
            await this.profileService.getActiveProfileSession()
                .map((session) => session.uid)
                .mergeMap((uid) => {
                    const actor = new Actor();
                    actor.id = uid;
                    actor.type = Actor.TYPE_SYSTEM;

                    const auditRequest: TelemetryAuditRequest = {
                        env: 'sdk',
                        actor,
                        currentState: AuditState.AUDIT_CREATED,
                        updatedProperties: ObjectUtil.getTruthyProps(group),
                        objId: group.gid,
                        objType: ObjectType.GROUP
                    };

                    return this.telemetryService.audit(auditRequest);
                }).toPromise();
        }).map(() => group);
    }

    deleteGroup(gid: string): Observable<undefined> {
        return Observable
            .defer(() => Observable.of(this.dbService.beginTransaction()))
            .mergeMap(() => {
                return Observable.zip(
                    this.dbService.delete({
                        table: GroupEntry.TABLE_NAME,
                        selection: `${GroupEntry.COLUMN_NAME_GID} = ?`,
                        selectionArgs: [gid]
                    }),
                    this.dbService.delete({
                        table: GroupProfileEntry.TABLE_NAME,
                        selection: `${GroupProfileEntry.COLUMN_NAME_GID} = ?`,
                        selectionArgs: [gid]
                    })
                ).mapTo(undefined);
            }).do(() => {
                this.dbService.endTransaction(true);
            }).do(async () => {
                await this.profileService.getActiveProfileSession()
                    .mergeMap((session: ProfileSession) => {
                        const actor = new Actor();
                        actor.id = session.uid;
                        actor.type = Actor.TYPE_SYSTEM;

                        const auditRequest: TelemetryAuditRequest = {
                            env: 'sdk',
                            actor,
                            currentState: AuditState.AUDIT_DELETED,
                            objId: gid,
                            objType: ObjectType.GROUP
                        };

                        return this.telemetryService.audit(auditRequest);
                    }).toPromise();
            }).catch((e) => {
                this.dbService.endTransaction(false);
                return Observable.throw(e);
            });
    }

    updateGroup(group: Group): Observable<Group> {
        return this.dbService.update({
            table: GroupEntry.TABLE_NAME,
            selection: 'gid = ?',
            selectionArgs: [group.gid],
            modelJson: {
                [GroupEntry.COLUMN_NAME_NAME]: group.name,
                [GroupEntry.COLUMN_NAME_SYLLABUS]: group.syllabus.join(','),
                [GroupEntry.COLUMN_NAME_UPDATED_AT]: Date.now(),
                [GroupEntry.COLUMN_NAME_GRADE]: group.grade.join(','),
                [GroupEntry.COLUMN_NAME_GRADE_VALUE]: JSON.stringify(group.gradeValue)
            }
        }).do(async (prevGroup) => {
            await this.profileService.getActiveProfileSession()
                .mergeMap((session: ProfileSession) => {
                    const actor = new Actor();
                    actor.id = session.uid;
                    actor.type = Actor.TYPE_SYSTEM;

                    const auditRequest: TelemetryAuditRequest = {
                        env: 'sdk',
                        actor,
                        currentState: AuditState.AUDIT_UPDATED,
                        updatedProperties: ObjectUtil.getPropDiff(group, prevGroup),
                        objId: group.gid,
                        objType: ObjectType.GROUP
                    };

                    return this.telemetryService.audit(auditRequest);
                }).toPromise();
        }).mapTo(group);
    }

    getActiveSessionGroup(): Observable<Group> {
        return this.getActiveGroupSession()
            .map((profileSession: GroupSession | undefined) => {
                if (!profileSession) {
                    throw new NoActiveGroupSessionError('No active session available');
                }

                return profileSession;
            })
            .mergeMap((profileSession: GroupSession) => {
                return this.dbService.read({
                    table: GroupEntry.TABLE_NAME,
                    selection: `${GroupEntry.COLUMN_NAME_GID} = ?`,
                    selectionArgs: [profileSession.gid]
                }).map((rows) => rows && rows[0]);
            });
    }

    setActiveSessionForGroup(gid: string): Observable<boolean> {
        return this.dbService
            .read({
                table: GroupEntry.TABLE_NAME,
                selection: `${GroupEntry.COLUMN_NAME_GID} = ?`,
                selectionArgs: [gid]
            })
            .map((rows: GroupEntry.SchemaMap[]) =>
                rows && rows[0] && GroupMapper.mapGroupDBEntryToGroup(rows[0])
            )
            .map((group: Group | undefined) => {
                if (!group) {
                    throw new NoGroupFoundError('No Profile found');
                }

                return group;
            })
            .mergeMap((group: Group) => {
                const groupSession = new GroupSession(group.gid);
                return this.sharedPreferences.putString(GroupServiceImpl.KEY_GROUP_SESSION, JSON.stringify({
                    gid: groupSession.gid,
                    sid: groupSession.sid,
                    createdTime: groupSession.createdTime
                })).mapTo(true);
            });
    }

    getActiveGroupSession(): Observable<GroupSession | undefined> {
        return this.sharedPreferences.getString(GroupServiceImpl.KEY_GROUP_SESSION)
            .map((response) => {
                if (!response) {
                    return undefined;
                }
                return JSON.parse(response);

            });
    }

    getAllGroups(groupRequest?: GetAllGroupRequest): Observable<Group[]> {
        return Observable.defer(() => {
            if (groupRequest) {
                return this.dbService.execute(`
                    SELECT * FROM ${GroupEntry.TABLE_NAME}
                    LEFT JOIN ${GroupProfileEntry.TABLE_NAME} ON
                    ${GroupEntry.TABLE_NAME}.${GroupEntry.COLUMN_NAME_GID} =
                    ${GroupProfileEntry.TABLE_NAME}.${GroupProfileEntry.COLUMN_NAME_GID}
                    WHERE ${GroupProfileEntry.COLUMN_NAME_UID} = "${groupRequest!.uid}"`
                ).map((groups: GroupEntry.SchemaMap[]) =>
                    groups.map((group: GroupEntry.SchemaMap) => GroupMapper.mapGroupDBEntryToGroup(group))
                );
            }

            return this.dbService.read({
                table: GroupEntry.TABLE_NAME,
                columns: []
            }).map((groups: GroupEntry.SchemaMap[]) =>
                groups.map((group: GroupEntry.SchemaMap) => GroupMapper.mapGroupDBEntryToGroup(group))
            );
        }).mergeMap((groups: Group[]) =>
            Observable.from(groups)
        ).mergeMap((group: Group) =>
            this.profileService.getAllProfiles({
                groupId: group.gid
            }).map((profiles) => ({
                ...group,
                profilesCount: profiles.length
            }))
        ).reduce((allResponses, currentResponse) => [...allResponses, currentResponse], []);
    }


    addProfilesToGroup(profileToGroupRequest: ProfilesToGroupRequest): Observable<number> {
        return Observable
            .defer(() => Observable.of(this.dbService.beginTransaction()))
            .mergeMap(() => this.dbService.delete({
                table: GroupProfileEntry.TABLE_NAME,
                selection: `${GroupProfileEntry.COLUMN_NAME_GID} = ?`,
                selectionArgs: [profileToGroupRequest.groupId]
            }))
            .switchMap(() => {
                return Observable.from(profileToGroupRequest.uidList)
                    .mergeMap((uid: string) => {
                        return this.dbService.insert({
                            table: GroupProfileEntry.TABLE_NAME,
                            modelJson: {
                                [GroupProfileEntry.COLUMN_NAME_GID]: profileToGroupRequest.groupId,
                                [GroupProfileEntry.COLUMN_NAME_UID]: uid
                            }
                        });
                    });
            })
            .do(() => {
                this.dbService.endTransaction(true);
            })
            .catch((e) => {
                this.dbService.endTransaction(false);
                return Observable.throw(e);
            });
    }

    removeActiveGroupSession(): Observable<undefined> {
        return this.getActiveGroupSession()
        .mergeMap( (groupSession) => {
            if (!groupSession) {
                return Observable.of(undefined);
            }
            return this.sharedPreferences.putString(GroupServiceImpl.KEY_GROUP_SESSION, '');
        });
    }
}
