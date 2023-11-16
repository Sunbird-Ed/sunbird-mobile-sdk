import { Container, inject, injectable } from "inversify";
import { CertificateService, CsLearnerCertificate, GetPublicKeyRequest, GetPublicKeyResponse } from "../def/certificate-service";
import {defer, Observable, interval, Observer} from 'rxjs';
import {catchError, map, tap,  concatMap, delay, filter, mergeMap, take} from 'rxjs/operators';
import { CsInjectionTokens, InjectionTokens } from "../../injection-tokens";
import { DbService } from "../../db";
import { GetPublicKeyHandler } from "../handlers/get-public-key-handler";
import { SdkConfig } from "../../sdk-config";
import {ProfileService} from '../../profile';
import {DownloadCertificateResponse} from '../../course/def/download-certificate-response';
import {GetCertificateRequest} from '../../course/def/get-certificate-request';
import { CsCertificateService, CSGetLearnerCerificateRequest, CsVerifyCertificateResponse, CsLearnerCertificateResponse, CsVerifyCertificateRequest } from "@project-sunbird/client-services/services/certificate";
import {KeyValueStore} from '../../key-value-store';
import {FileService} from '../../util/file/def/file-service';
import {gzip} from 'pako/dist/pako_deflate';
import {ungzip} from 'pako/dist/pako_inflate';
import { DownloadCertificateRequest } from "../../course/def/download-certificate-request";


@injectable()
export class CertificateServiceImpl implements CertificateService {

    constructor(@inject(InjectionTokens.CONTAINER) private container: Container,
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService,
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore,
        @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService) {
    }

    getCertificates(req: CSGetLearnerCerificateRequest): Observable<CsLearnerCertificateResponse> {
        return this.csCertificateService.fetchCertificates(req);
    }
   
    getPublicKey(request: GetPublicKeyRequest): Observable<GetPublicKeyResponse> {
        return new GetPublicKeyHandler(this.dbService, this.container, this.sdkConfig.certificateServiceConfig, this.sdkConfig.apiConfig).handle(request)
    }

    getCertificate(request: GetCertificateRequest): Observable<string> {
        return this.csCertificateService.getCerificateDownloadURI({
            certificateId: request.certificate.identifier!,
            type:request.certificate.type,
            schemaName: 'certificate',
            templateUrl: request.certificate.templateUrl
        }).pipe(
            tap(async (r) => {
                await this.keyValueStore.setValue(
                    await this.buildCertificatePersistenceId(request),
                    gzip(r.printUri, {to: 'string'})
                ).toPromise();
            }),
            map((r) => r.printUri),
            catchError((e) => {
                return defer(async () => {
                    const cached = await this.getCertificateFromCache(request);
                    if (cached) {
                        return cached;
                    }
                    throw e;
                });
            })
        );
    }

   downloadCertificate({ fileName, blob }: DownloadCertificateRequest): Observable<DownloadCertificateResponse> {
        return defer(async () => {
            return this.fileService.writeFile(
                window['Capacitor']['Plugins'].Directory.Data,
                fileName, blob as any,
                {replace: true}
            ).
            then(() => {
                return {
                    path: `${window['Capacitor']['Plugins'].Directory.Data}${fileName}`
                };
            });
        });
    }

    public downloadLegacyeCertificate(request: GetCertificateRequest): Observable<DownloadCertificateResponse> {
        return defer(async () => {
            const activeProfile = (await this.profileService.getActiveProfileSession().toPromise());
            const userId = activeProfile.managedSession ? activeProfile.managedSession.uid : activeProfile.uid;
            let devicePlatform = "";
            await window['Capacitor']['Plugins'].Device.getInfo().then((val) => {
                devicePlatform = val.platform
            })
            const folderPath = (devicePlatform.toLowerCase() === 'ios') ? window['Capacitor']['Plugins'].Directory.Documents : window['Capacitor']['Plugins'].Directory.EXTERNAL;
            const filePath = `${folderPath}Download/${request.certificate.name}_${request.courseId}_${userId}.pdf`;
            return { userId };
        }).pipe(
            mergeMap(({ userId }) => {

                return this.csCertificateService.getLegacyCerificateDownloadURI({
                    pdfUrl: request.certificate.url!,
                }).pipe(
                    map((response) => {
                        return {
                            signedPdfUrl: response.signedUrl,
                            userId
                        };
                    })
                );
            }),
            mergeMap(({ signedPdfUrl, userId }) => {
                const downloadRequest: EnqueueRequest = {
                    uri: signedPdfUrl,
                    title: request.certificate.token,
                    description: '',
                    mimeType: 'application/pdf',
                    visibleInDownloadsUi: true,
                    notificationVisibility: 1,
                    destinationInExternalPublicDir: {
                        dirType: 'Download',
                        subPath: `/${request.certificate.name}_${request.courseId}_${userId}.pdf`
                    },
                    headers: []
                };

                return new Observable<string>((observer: Observer<string>) => {
                    downloadManager.enqueue(downloadRequest, (err, id: string) => {
                        if (err) {
                            return observer.error(err);
                        }

                        observer.next(id);
                        observer.complete();
                    });
                }) as Observable<string>;
            }),
            mergeMap((downloadId: string) => {
                return interval(1000)
                    .pipe(
                        mergeMap(() => {
                            return new Observable((observer: Observer<EnqueuedEntry>) => {
                                downloadManager.query({ ids: [downloadId] }, (err, entries) => {
                                    if (err || (entries[0].status === DownloadStatus.STATUS_FAILED)) {
                                        return observer.error(err || new Error('Unknown Error'));
                                    }

                                    return observer.next(entries[0]! as EnqueuedEntry);
                                });
                            });
                        }),
                        filter((entry: EnqueuedEntry) => entry.status === DownloadStatus.STATUS_SUCCESSFUL),
                        take(1)
                    );
            }),
            map((entry) => ({ path: entry.localUri }))
        );
    }

    isCertificateCached(request: GetCertificateRequest): Observable<boolean> {
        return defer(async () => {
            try {
                return !!(await this.getCertificateFromCache(request));
            } catch (e) {
                console.error(e);
                return false;
            }
        });
    }

    getEncodedData(req): Promise<any> {
        return this.csCertificateService.getEncodedData(req)
    }

    verifyCertificate(req: CsVerifyCertificateRequest): Observable<CsVerifyCertificateResponse>{
        return this.csCertificateService.verifyCertificate(req)
    }

    private get csCertificateService(): CsCertificateService {
        return this.container.get(CsInjectionTokens.CERTIFICATE_SERVICE);
    }

    private async buildCertificatePersistenceId(request: GetCertificateRequest): Promise<string> {
        const session = await this.profileService.getActiveProfileSession().toPromise();
        const userId = session.managedSession ? session.managedSession.uid : session.uid;
        return `certificate_${request.certificate.identifier}_${request.courseId}_${userId}`;
    }

    private async getCertificateFromCache(request: GetCertificateRequest): Promise<string | undefined> {
        const value = await this.keyValueStore.getValue(
            await this.buildCertificatePersistenceId(request),
        ).toPromise();
        return value ? ungzip(value, {to: 'string'}) : undefined;
    }

}