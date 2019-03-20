import { Observable } from 'rxjs';
export interface DownloadCompleteDelegate {
    onDownloadComplete(request: any): Observable<undefined>;
}
