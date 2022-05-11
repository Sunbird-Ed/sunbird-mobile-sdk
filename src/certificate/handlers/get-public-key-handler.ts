import { ApiConfig } from '../../api';
import { Observable, of } from 'rxjs';
import { mapTo, mergeMap } from 'rxjs/operators';
import { CsInjectionTokens } from '../../injection-tokens';
import { Container } from 'inversify';
import { CsCertificateService } from '@project-sunbird/client-services/services/certificate';
import { GetPublicKeyRequest, GetPublicKeyResponse } from '@project-sunbird/client-services/services/certificate';
import { DbService } from 'src';
import { CertificatePublicKeyEntry } from '../db/schema';
import { CertificateServiceConfig } from '../config/certificate-service-config';

export class GetPublicKeyHandler {

    constructor(
        private dbService: DbService,
        private container: Container,
        private certificateServiceConfig: CertificateServiceConfig,
        private apiConfig: ApiConfig
    ) {
    }

    private get csCertificateService(): CsCertificateService {
        return this.container.get(CsInjectionTokens.CERTIFICATE_SERVICE);
    }

    handle(request: GetPublicKeyRequest): Observable<GetPublicKeyResponse> {
        return this.dbService.read({
            table: CertificatePublicKeyEntry.TABLE_NAME,
            selection: `${CertificatePublicKeyEntry.COLUMN_NAME_IDENTIFIER}= ?`,
            selectionArgs: [request.osid.toString()]
        }).pipe(
            mergeMap((publicKeyInDb: CertificatePublicKeyEntry.SchemaMap[]) => {
                if (publicKeyInDb && publicKeyInDb.length) {
                    if (publicKeyInDb[0].expiry_time < Date.now()) {
                        return this.fetchFromServer(request).pipe(
                            mergeMap((response: GetPublicKeyResponse) => {
                                return this.updatePublicKey(response)
                            }),
                        );
                    } else {
                        return of({
                            osid: publicKeyInDb[0].identifier,
                            value: publicKeyInDb[0].public_key,
                            alg: publicKeyInDb[0].alg,
                            osOwner: publicKeyInDb[0].owner ? publicKeyInDb[0].owner.split(',') : []
                        })
                    }
                } else {
                    return this.fetchFromServer(request).pipe(
                        mergeMap((response: GetPublicKeyResponse) => {
                            return this.insertPublicKey(response)
                        })
                    );
                }
            })
        );

    }

    private updatePublicKey(response: GetPublicKeyResponse): Observable<GetPublicKeyResponse> {
        return this.dbService.update({
            table: CertificatePublicKeyEntry.TABLE_NAME,
            selection: `${CertificatePublicKeyEntry.COLUMN_NAME_IDENTIFIER} = ?`,
            selectionArgs: [response.osid],
            modelJson: {
                identifier: response.osid,
                public_key: response.value,
                alg: response.alg,
                owner: response.osOwner && response.osOwner.length ? response.osOwner.join(',') : '',
                expiry_time: Date.now() + this.apiConfig.cached_requests.timeToLive
            }
        }).pipe(
            mapTo(response)
        )
    }

    private insertPublicKey(response: GetPublicKeyResponse): Observable<GetPublicKeyResponse> {
        return this.dbService.insert({
            table: CertificatePublicKeyEntry.TABLE_NAME,
            modelJson: {
                identifier: response.osid,
                public_key: response.value,
                alg: response.alg,
                owner: response.osOwner && response.osOwner.length ? response.osOwner.join(',') : '',
                expiry_time: Date.now() + this.apiConfig.cached_requests.timeToLive
            }
        }).pipe(
            mapTo(response)
        )
    }

    private fetchFromServer(request: GetPublicKeyRequest): Observable<GetPublicKeyResponse> {
        return this.csCertificateService.getPublicKey(request);
    }

}
