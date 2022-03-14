
import { GetPublicKeyRequest, GetPublicKeyResponse } from '@project-sunbird/client-services/services/certificate';
import { Observable } from 'rxjs';
import { GetCertificateRequest } from '../../course/def/get-certificate-request';

export { GetPublicKeyRequest, GetPublicKeyResponse, FetchCertificateRequest, FetchCertificateResponse } from '@project-sunbird/client-services/services/certificate';
export interface CertificateService {

    getPublicKey(request: GetPublicKeyRequest): Observable<GetPublicKeyResponse>;
    getCertificate( downloadCertificateRequest: GetCertificateRequest ): Observable<string>;

}