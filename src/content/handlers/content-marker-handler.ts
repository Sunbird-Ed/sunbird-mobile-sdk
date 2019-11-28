import {DbService} from '../../db';
import {ContentMarker} from '..';
import {Observable} from 'rxjs';
import {ContentMarkerEntry} from '../db/schema';
import {ContentUtil} from '../util/content-util';
import { map } from 'rxjs/operators';

export class ContentMarkerHandler {
    constructor(private dbService: DbService) {
    }

    public getContentMarker(identifier: string, uid: string): Observable<ContentMarker[]> {
        const query = `SELECT * FROM ${ContentMarkerEntry.TABLE_NAME}
                       ${ContentUtil.getUidnIdentifierFiler(uid, identifier)}
                       ORDER BY ${ContentMarkerEntry.COLUMN_NAME_EPOCH_TIMESTAMP} DESC `;
        return this.dbService.execute(query).pipe(
            map((markersInDb: ContentMarkerEntry.SchemaMap[]) =>
                this.mapDBEntriesToContentMarkerDetails(markersInDb)
            )
        );
    }

    public mapDBEntriesToContentMarkerDetails(markersInDb: ContentMarkerEntry.SchemaMap[]): ContentMarker[] {
        return markersInDb.map((markerInDb: ContentMarkerEntry.SchemaMap) => {
            return {
                contentId: markerInDb[ContentMarkerEntry.COLUMN_NAME_CONTENT_IDENTIFIER],
                uid: markerInDb[ContentMarkerEntry.COLUMN_NAME_UID],
                extraInfoMap: markerInDb[ContentMarkerEntry.COLUMN_NAME_EXTRA_INFO] &&
                    JSON.parse(markerInDb[ContentMarkerEntry.COLUMN_NAME_EXTRA_INFO]),
                marker: markerInDb[ContentMarkerEntry.COLUMN_NAME_MARKER]
            };
        });
    }
}
