import { Observable } from 'rxjs';
import { DownloadCertificateRequest } from './download-certificate-request';
import { DownloadCertificateResponse } from './download-certificate-response';
import { GetCertificateRequest } from './get-certificate-request';
export interface CourseCertificateManager {
    isCertificateCached(request: GetCertificateRequest): Observable<boolean>;
    getCertificate(request: GetCertificateRequest): Observable<string>;
    downloadCertificate(downloadCertificateRequest: DownloadCertificateRequest): Observable<DownloadCertificateResponse>;
}
