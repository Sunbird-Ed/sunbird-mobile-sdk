import { DownloadRequest } from './requests';
export interface DownloadTracking {
    completed: DownloadRequest[];
    queued: DownloadRequest[];
}
