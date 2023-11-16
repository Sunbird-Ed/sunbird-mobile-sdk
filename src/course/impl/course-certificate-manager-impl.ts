import {CourseCertificateManager} from '../def/course-certificate-manager';
import {DownloadCertificateRequest} from '../def/download-certificate-request';
import {defer, Observable} from 'rxjs';
import {DownloadCertificateResponse} from '../def/download-certificate-response';
import {GetCertificateRequest} from '../def/get-certificate-request';
import {CsCourseService} from '@project-sunbird/client-services/services/course';
import {catchError, map, tap} from 'rxjs/operators';
import {ProfileService} from '../../profile';
import {KeyValueStore} from '../../key-value-store';
import {FileService} from '../../util/file/def/file-service';
import {gzip} from 'pako/dist/pako_deflate';
import {ungzip} from 'pako/dist/pako_inflate';

export class CourseCertificateManagerImpl implements CourseCertificateManager {
    constructor(
        private profileService: ProfileService,
        private fileService: FileService,
        private keyValueStore: KeyValueStore,
        private csCourseService: CsCourseService,
    ) {
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

    getCertificate(request: GetCertificateRequest): Observable<string> {
        return this.csCourseService.getSignedCourseCertificate(request.certificate.identifier!).pipe(
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
