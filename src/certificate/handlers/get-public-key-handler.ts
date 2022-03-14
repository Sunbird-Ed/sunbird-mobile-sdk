import { ApiConfig } from '../../api';
import { Observable, of } from 'rxjs';
import {  mapTo, mergeMap } from 'rxjs/operators';
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
            selectionArgs: [request.signingKey.toString()]
        }).pipe(
            mergeMap((publicKeyInDb: CertificatePublicKeyEntry.SchemaMap[]) => {
                if (publicKeyInDb && publicKeyInDb.length) {
                    if (publicKeyInDb[0].expiry_time > Date.now()) {
                        return this.fetchFromServer(request).pipe(
                            mergeMap((response: GetPublicKeyResponse) => {
                                return this.updatePublicKey(request.signingKey, response)
                            }),
                        );
                    } else {
                        return of({
                           osid: publicKeyInDb[0].public_key 
                        })
                    }
                } else {
                    return this.fetchFromServer(request).pipe(
                        mergeMap((response: GetPublicKeyResponse) => {
                            return this.insertPublicKey(request.signingKey, response)
                        })
                    );
                }
            })
        );

    }

    private updatePublicKey(id: string, response: GetPublicKeyResponse): Observable<GetPublicKeyResponse> {
        return this.dbService.update({
            table: CertificatePublicKeyEntry.TABLE_NAME,
            selection: `${CertificatePublicKeyEntry.COLUMN_NAME_IDENTIFIER} = ?`,
            selectionArgs: [id],
            modelJson: {
                identifier: id,
                public_key: response.osid,
                expiry_time: Date.now() + this.apiConfig.cached_requests.timeToLive
            }
        }).pipe(
            mapTo(response)
        )
    }

    private insertPublicKey(id: string, response: GetPublicKeyResponse): Observable<GetPublicKeyResponse> {
        return this.dbService.insert({
            table: CertificatePublicKeyEntry.TABLE_NAME,
            modelJson: {
                identifier: id,
                public_key: response.osid,
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
