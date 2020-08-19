import {DbService} from '../../db';
import {GroupEntry, GroupProfileEntry} from '../db/schema';
import {
    GetAllGroupRequestDeprecated,
    GroupDeprecated,
    GroupServiceDeprecated,
    GroupSessionDeprecated,
    NoActiveGroupSessionError,
    NoGroupFoundError,
    ProfilesToGroupRequestDeprecated
} from '..';
import {GroupMapper} from '../util/group-mapper';
import {UniqueId} from '../../db/util/unique-id';
import {ProfileService, ProfileSession} from '../../profile';
import {SharedPreferences} from '../../util/shared-preferences';
import {GroupKeys} from '../../preference-keys';
import {Actor, AuditState, ObjectType, TelemetryAuditRequest, TelemetryService} from '../../telemetry';
import {ObjectUtil} from '../../util/object-util';
import {Container, inject, injectable} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {defer, from, Observable, of, throwError, zip} from 'rxjs';
import {catchError, map, mapTo, mergeMap, reduce, tap} from 'rxjs/operators';

@injectable()
export class GroupServiceDeprecatedImpl implements GroupServiceDeprecated {
    private static readonly KEY_GROUP_SESSION = GroupKeys.KEY_GROUP_SESSION;

    constructor(@inject(InjectionTokens.CONTAINER) private container: Container,
                @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
                @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService,
                @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences) {
    }

    private get telemetryService(): TelemetryService {
        return this.container.get<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE);
    }

    createGroup(group: GroupDeprecated): Observable<GroupDeprecated> {
        group.gid = UniqueId.generateUniqueId();
        group.createdAt = Date.now();
        group.updatedAt = Date.now();

        return this.dbService.insert({
            table: GroupEntry.TABLE_NAME,
            modelJson: GroupMapper.mapGroupToGroupDBEntry(group)
        }).pipe(
            tap(async () => {
                await this.profileService.getActiveProfileSession().pipe(
                    map((session) => session.uid),
                    mergeMap((uid) => {
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
                    })
                ).toPromise();
            }),
            map(() => group)
        );
    }

    deleteGroup(gid: string): Observable<undefined> {
        return defer(() => of(this.dbService.beginTransaction())).pipe(
            mergeMap(() => {
                return zip(
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
                ).pipe(
                    mapTo(undefined)
                );
            }),
            tap(() => {
                this.dbService.endTransaction(true);
            }),
            tap(async () => {
                await this.profileService.getActiveProfileSession().pipe(
                    mergeMap((session: ProfileSession) => {
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
                    })
                ).toPromise();
            }),
            catchError((e) => {
                this.dbService.endTransaction(false);
                return Observable.throw(e);
            })
        );
    }

    updateGroup(group: GroupDeprecated): Observable<GroupDeprecated> {
        return this.dbService.read({
            table: GroupEntry.TABLE_NAME,
            selection: 'gid = ?',
            selectionArgs: [group.gid],
        }).pipe(
            map((rows) => {
                if (!rows || !rows[0]) {
                    return Observable.throw(new NoGroupFoundError(`No Group found with ID ${group.gid}`));
                }

                return GroupMapper.mapGroupDBEntryToGroup(rows[0]);
            }),
            tap(async (prevGroup) => {
                await this.profileService.getActiveProfileSession().pipe(
                    mergeMap((session: ProfileSession) => {
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
                    })
                ).toPromise();
            }),
            mergeMap(() => {
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
                }).pipe(
                    mapTo(group)
                );
            })
        );
    }

    getActiveSessionGroup(): Observable<GroupDeprecated> {
        return this.getActiveGroupSession().pipe(
            map((profileSession: GroupSessionDeprecated | undefined) => {
                if (!profileSession) {
                    throw new NoActiveGroupSessionError('No active session available');
                }

                return profileSession;
            }),
            mergeMap((profileSession: GroupSessionDeprecated) => {
                return this.dbService.read({
                    table: GroupEntry.TABLE_NAME,
                    selection: `${GroupEntry.COLUMN_NAME_GID} = ?`,
                    selectionArgs: [profileSession.gid]
                }).pipe(
                    map((rows) => rows && rows[0])
                );
            })
        );
    }

    setActiveSessionForGroup(gid: string): Observable<boolean> {
        return this.dbService.read({
            table: GroupEntry.TABLE_NAME,
            selection: `${GroupEntry.COLUMN_NAME_GID} = ?`,
            selectionArgs: [gid]
        }).pipe(
            map((rows: GroupEntry.SchemaMap[]) =>
                rows && rows[0] && GroupMapper.mapGroupDBEntryToGroup(rows[0])
            ),
            map((group: GroupDeprecated | undefined) => {
                if (!group) {
                    throw new NoGroupFoundError('No Profile found');
                }

                return group;
            }),
            mergeMap((group: GroupDeprecated) => {
                const groupSession = new GroupSessionDeprecated(group.gid);
                return this.sharedPreferences.putString(GroupServiceDeprecatedImpl.KEY_GROUP_SESSION, JSON.stringify({
                    gid: groupSession.gid,
                    sid: groupSession.sid,
                    createdTime: groupSession.createdTime
                })).pipe(
                    mapTo(true)
                );
            })
        );
    }

    getActiveGroupSession(): Observable<GroupSessionDeprecated | undefined> {
        return this.sharedPreferences.getString(GroupServiceDeprecatedImpl.KEY_GROUP_SESSION).pipe(
            map((response) => {
                if (!response) {
                    return undefined;
                }
                return JSON.parse(response);

            })
        );
    }

    getAllGroups(groupRequest?: GetAllGroupRequestDeprecated): Observable<GroupDeprecated[]> {
        return defer(() => {
            if (groupRequest) {
                return this.dbService.execute(`
                    SELECT * FROM ${GroupEntry.TABLE_NAME}
                    LEFT JOIN ${GroupProfileEntry.TABLE_NAME} ON
                    ${GroupEntry.TABLE_NAME}.${GroupEntry.COLUMN_NAME_GID} =
                    ${GroupProfileEntry.TABLE_NAME}.${GroupProfileEntry.COLUMN_NAME_GID}
                    WHERE ${GroupProfileEntry.COLUMN_NAME_UID} = "${groupRequest!.uid}"`
                ).pipe(
                    map((groups: GroupEntry.SchemaMap[]) =>
                        groups.map((group: GroupEntry.SchemaMap) => GroupMapper.mapGroupDBEntryToGroup(group))
                    )
                );
            }

            return this.dbService.read({
                table: GroupEntry.TABLE_NAME,
                columns: []
            }).pipe(
                map((groups: GroupEntry.SchemaMap[]) =>
                    groups.map((group: GroupEntry.SchemaMap) => GroupMapper.mapGroupDBEntryToGroup(group))
                )
            );
        }).pipe(
            mergeMap((groups: GroupDeprecated[]) =>
                from(groups)
            ),
            mergeMap((group: GroupDeprecated) =>
                this.profileService.getAllProfiles({
                    groupId: group.gid
                }).pipe(
                    map((profiles) => ({
                        ...group,
                        profilesCount: profiles.length
                    }))
                )
            ),
            reduce((allResponses: GroupDeprecated[], currentResponse: GroupDeprecated) => [...allResponses, currentResponse], [])
        );
    }


    addProfilesToGroup(profileToGroupRequest: ProfilesToGroupRequestDeprecated): Observable<number> {
        return defer(() => of(this.dbService.beginTransaction())).pipe(
            mergeMap(() => this.dbService.delete({
                table: GroupProfileEntry.TABLE_NAME,
                selection: `${GroupProfileEntry.COLUMN_NAME_GID} = ?`,
                selectionArgs: [profileToGroupRequest.groupId]
            })),
            mergeMap(() => {
                if (!profileToGroupRequest.uidList.length) {
                    return of(0);
                }

                return zip(
                    ...profileToGroupRequest.uidList.map((uid) => {
                        return this.dbService.insert({
                            table: GroupProfileEntry.TABLE_NAME,
                            modelJson: {
                                [GroupProfileEntry.COLUMN_NAME_GID]: profileToGroupRequest.groupId,
                                [GroupProfileEntry.COLUMN_NAME_UID]: uid
                            }
                        });
                    })
                ).pipe(
                    mapTo(profileToGroupRequest.uidList.length)
                );
            }),
            tap(() => {
                this.dbService.endTransaction(true);
            }),
            catchError((e) => {
                this.dbService.endTransaction(false);
                return throwError(e);
            })
        );
    }

    removeActiveGroupSession(): Observable<undefined> {
        return this.getActiveGroupSession().pipe(
            mergeMap((groupSession) => {
                if (!groupSession) {
                    return of(undefined);
                }
                return this.sharedPreferences.putString(GroupServiceDeprecatedImpl.KEY_GROUP_SESSION, '');
            })
        );
    }
}
