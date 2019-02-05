
import {DbService, NoSqlFormatter} from '../../db';
import {Observable} from 'rxjs';
import {GroupEntry, GroupProfileEntry} from '../db/schema';
import {UniqueId} from '../../db/util/unique-id';
import {Group} from '../def/group';
import {ProfilesToGroupRequest} from '../def/profiles-to-group-request';
import {GetAllGroupRequest} from '../def/get-all-group-request';
import {GroupService} from '../def/group-service';

export class GroupServiceImpl implements GroupService {

    constructor(private dbService: DbService) {
    }

    createGroup(group: Group): Observable<Group> {
        const saveGroupToDb = NoSqlFormatter.toDb(group);
        if (group !== undefined) {
            this.dbService.insert({
                table: GroupEntry.TABLE_NAME,
                modelJson: {
                    [GroupEntry.COLUMN_NAME_GID]: UniqueId.generateUniqueId(),
                    [GroupEntry.COLUMN_NAME_NAME]: saveGroupToDb.groupName,
                    [GroupEntry.COLUMN_NAME_CREATED_AT]: Date.now(),
                    [GroupEntry.COLUMN_NAME_GRADE]: saveGroupToDb.grade,
                    [GroupEntry.COLUMN_NAME_GRADE_VALUE]: saveGroupToDb.gradeValue,
                    [GroupEntry.COLUMN_NAME_SYLLABUS]: saveGroupToDb.syllabus,
                    [GroupEntry.COLUMN_NAME_UPDATED_AT]: Date.now()
                }
            });
        }
        return Observable.of(group);
    }

    deleteGroup(gid: string): Observable<undefined> {
        this.dbService.beginTransaction();

        return Observable.zip(
            this.dbService.delete({
                table: GroupEntry.TABLE_NAME,
                selection: `${GroupEntry.COLUMN_NAME_GID} = ?`,
                selectionArgs: [`"${gid}"`]
            }),
            this.dbService.delete({
                table: GroupProfileEntry.TABLE_NAME,
                selection: `${GroupProfileEntry.COLUMN_NAME_GID} = ?`,
                selectionArgs: [`"${gid}"`]
            })
        ).do(() => {
            this.dbService.endTransaction(true);
        }).map(() => {
            return undefined;
        });
    }

    updateGroup(group: Group): Observable<Group> {
        const updateToDb: Group = NoSqlFormatter.toDb(group);
        this.dbService.update({
            table: GroupEntry.TABLE_NAME,
            selection: 'gid = ?',
            modelJson: {
                [GroupEntry.COLUMN_NAME_NAME]: updateToDb.name,
                [GroupEntry.COLUMN_NAME_SYLLABUS]: updateToDb.syllabus,
                [GroupEntry.COLUMN_NAME_UPDATED_AT]: Date.now(),
                [GroupEntry.COLUMN_NAME_GRADE]: updateToDb.grade,
                [GroupEntry.COLUMN_NAME_GRADE_VALUE]: updateToDb.gradeValueMap
            }
        });
        return Observable.of(group);
    }

    getAllGroup(groupRequest: GetAllGroupRequest): Observable<Group[]> {
        if (!groupRequest.uid) {
            return this.dbService.read({
                table: GroupEntry.TABLE_NAME,
                columns: []
            });
        } else {
            return this.dbService.execute(`
            SELECT * FROM ${GroupEntry.TABLE_NAME} LEFT JOIN ${GroupProfileEntry.TABLE_NAME} ON
            ${GroupEntry.COLUMN_NAME_GID} = ${GroupProfileEntry.COLUMN_NAME_GID} WHERE
            ${GroupProfileEntry.COLUMN_NAME_UID} = "${groupRequest.uid}
        `);
        }
    }


    addProfilesToGroup(profileToGroupRequest: ProfilesToGroupRequest): Observable<number> {
        return this.dbService.delete({
            table: GroupProfileEntry.TABLE_NAME,
            selection: `${GroupProfileEntry.COLUMN_NAME_GID} = ?`,
            selectionArgs: [`"${profileToGroupRequest.groupId}"`]
        }).do(() => {
            this.dbService.beginTransaction();
        }).switchMap(() => {
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
        }).do(() => {
            this.dbService.endTransaction(true);
        }).catch((e) => {
            this.dbService.endTransaction(false);
            return Observable.throw(e);
        });
    }
}
