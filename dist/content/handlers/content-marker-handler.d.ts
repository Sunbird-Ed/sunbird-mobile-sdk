import { DbService } from '../../db';
import { ContentMarker } from '..';
import { Observable } from 'rxjs';
import { ContentMarkerEntry } from '../db/schema';
export declare class ContentMarkerHandler {
    private dbService;
    constructor(dbService: DbService);
    getContentMarker(identifier: string, uid: string): Observable<ContentMarker[]>;
    mapDBEntriesToContentMarkerDetails(markersInDb: ContentMarkerEntry.SchemaMap[]): ContentMarker[];
}
