import { CourseCertificateManager } from '../def/course-certificate-manager';
import { DownloadCertificateRequest } from '../def/download-certificate-request';
import { Observable } from 'rxjs';
import { DownloadCertificateResponse } from '../def/download-certificate-response';
import { GetCertificateRequest } from '../def/get-certificate-request';
import { CsCourseService } from '@project-sunbird/client-services/services/course';
import { ProfileService } from '../../profile';
import { KeyValueStore } from '../../key-value-store';
import { FileService } from '../../util/file/def/file-service';
export declare class CourseCertificateManagerImpl implements CourseCertificateManager {
    private profileService;
    private fileService;
    private keyValueStore;
    private csCourseService;
    constructor(profileService: ProfileService, fileService: FileService, keyValueStore: KeyValueStore, csCourseService: CsCourseService);
    isCertificateCached(request: GetCertificateRequest): Observable<boolean>;
    getCertificate(request: GetCertificateRequest): Observable<string>;
    downloadCertificate({ fileName, blob }: DownloadCertificateRequest): Observable<DownloadCertificateResponse>;
    private buildCertificatePersistenceId;
    private getCertificateFromCache;
}
