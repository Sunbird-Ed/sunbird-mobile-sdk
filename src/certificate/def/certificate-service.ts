
import { CsLearnerCertificate } from '@project-sunbird/client-services/models';
import { GetPublicKeyRequest, GetPublicKeyResponse, CSGetLearnerCerificateRequest } from '@project-sunbird/client-services/services/certificate';
import { Observable } from 'rxjs';
import { DownloadCertificateRequest } from '../../course/def/download-certificate-request';
import { DownloadCertificateResponse } from '../../course/def/download-certificate-response';
import { GetCertificateRequest } from '../../course/def/get-certificate-request';

export {
    GetPublicKeyRequest,
    GetPublicKeyResponse,
    FetchCertificateRequest,
    FetchCertificateResponse,
    CSGetLearnerCerificateRequest
} from '@project-sunbird/client-services/services/certificate';

export { CsLearnerCertificate } from '@project-sunbird/client-services/models';

export interface CertificateService {

    getCertificates(req: CSGetLearnerCerificateRequest): Observable<CsLearnerCertificate[]>;
    getPublicKey(request: GetPublicKeyRequest): Observable<GetPublicKeyResponse>;
    getCertificate(downloadCertificateRequest: GetCertificateRequest): Observable<string>;
    downloadCertificate(downloadCertificateRequest: DownloadCertificateRequest): Observable<DownloadCertificateResponse>;
    isCertificateCached(request: GetCertificateRequest): Observable<boolean>;

}