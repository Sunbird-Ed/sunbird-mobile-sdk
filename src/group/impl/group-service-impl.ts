
import { DbService, NoSqlFormatter } from '../../db';
import { Observable } from 'rxjs';
import { GroupEntry, GroupProfileEntry } from '../db/schema';
import { Group } from '../def/group';
import { ProfilesToGroupRequest } from '../def/profiles-to-group-request';
import { GetAllGroupRequest } from '../def/get-all-group-request';
import { GroupService } from '../def/group-service';
import { GroupMapper } from '../util/group-mapper';


export class GroupServiceImpl implements GroupService {

    constructor(private dbService: DbService) {
    }
    createGroup(group: Group): Observable<Group> {
        group.createdAt = Date.now();
        group.updatedAt = Date.now();
        this.dbService.insert({
            table: GroupEntry.TABLE_NAME,
            modelJson: GroupMapper.mapGroupToGroupDBEntry(group)
        });
        return Observable.of(group);
    }

    deleteGroup(gid: string): Observable<undefined> {
        this.dbService.beginTransaction();

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
            ${GroupEntry.TABLE_NAME}.${GroupEntry.COLUMN_NAME_GID} = ${GroupProfileEntry.TABLE_NAME}.${GroupProfileEntry.COLUMN_NAME_GID}
            WHERE ${GroupProfileEntry.COLUMN_NAME_UID} = "${groupRequest.uid}"
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
