
import { CsLearnerCertificate } from '@project-sunbird/client-services/models';
import { GetPublicKeyRequest, GetPublicKeyResponse, CSGetLearnerCerificateRequest, CsVerifyCertificateRequest, CsLearnerCertificateResponse } from '@project-sunbird/client-services/services/certificate';
import { Observable } from 'rxjs';
import { DownloadCertificateRequest } from '../../course/def/download-certificate-request';
import { DownloadCertificateResponse } from '../../course/def/download-certificate-response';
import { GetCertificateRequest } from '../../course/def/get-certificate-request';

export {
    GetPublicKeyRequest,
    GetPublicKeyResponse,
    FetchCertificateRequest,
    FetchCertificateResponse,
    CSGetLearnerCerificateRequest,
    CsVerifyCertificateResponse
} from '@project-sunbird/client-services/services/certificate';

export { CsLearnerCertificate } from '@project-sunbird/client-services/models';

export interface CertificateService {

    getCertificates(req: CSGetLearnerCerificateRequest): Observable<CsLearnerCertificateResponse>;
    getPublicKey(request: GetPublicKeyRequest): Observable<GetPublicKeyResponse>;
    getCertificate(downloadCertificateRequest: GetCertificateRequest): Observable<string>;
    downloadCertificate(downloadCertificateRequest: DownloadCertificateRequest): Observable<DownloadCertificateResponse>;
    downloadLegacyeCertificate( downloadCertificateRequest: GetCertificateRequest): Observable<DownloadCertificateResponse>;
    isCertificateCached(request: GetCertificateRequest): Observable<boolean>;
    getEncodedData(req: string): Promise<any>;
    verifyCertificate(req: CsVerifyCertificateRequest): Observable<any>;
}