import {CourseCertificateManager} from '../def/course-certificate-manager';
import {DownloadCertificateRequest} from '../def/download-certificate-request';
import {defer, Observable} from 'rxjs';
import {DownloadCertificateResponse} from '../def/download-certificate-response';
import {GetCertificateRequest} from '../def/get-certificate-request';
import {CsCourseService} from '@project-sunbird/client-services/services/course';
import {catchError, map, tap} from 'rxjs/operators';
import {FileService} from '../../util/file/def/file-service';
import {ProfileService} from '../../profile';

export class CourseCertificateManagerImpl implements CourseCertificateManager {
    constructor(
        private profileService: ProfileService,
        private fileService: FileService,
        private csCourseService: CsCourseService,
    ) {
    }

    private static buildCertificatePersistenceId(
        userId: string,
        courseId: string,
        certificateId: string
    ): string {
        return `${certificateId}_${courseId}_${userId}`;
    }

    isCertificateCached(request: GetCertificateRequest): Observable<boolean> {
        return defer(async () => {
            try {
                return !!(await this.getCertificateFromCache(request));
            } catch (e) {
                return false;
            }
        });
    }

    getCertificate(request: GetCertificateRequest): Observable<string> {
        return this.csCourseService.getSignedCourseCertificate(request.certificate.identifier!).pipe(
            tap(async (r) => {
                await this.fileService.writeFile(
                    cordova.file.cacheDirectory + 'certificates',
                    await this.buildCertificatePersistenceFileName(request),
                    r.printUri,
                    {
                        replace: true
                    }
                );
            }),
            map((r) => r.printUri),
            catchError(() => {
                return defer(async () => {
                    return await this.getCertificateFromCache(request);
                });
            })
        );
    }

    downloadCertificate({ fileName, blob }: DownloadCertificateRequest): Observable<DownloadCertificateResponse> {
        return defer(async () => {
            return this.fileService.writeFile(
                cordova.file.externalRootDirectory + 'Download/',
                fileName, blob as any,
                {replace: true}
            ).then(() => {
                return {
                    path: `${cordova.file.externalRootDirectory}Download/${fileName}`
                };
            });
        });
    }

    private async buildCertificatePersistenceFileName(request: GetCertificateRequest): Promise<string> {
        const session = await this.profileService.getActiveProfileSession().toPromise();
        const userId = session.managedSession ? session.managedSession.uid : session.uid;
        return `${CourseCertificateManagerImpl.buildCertificatePersistenceId(
            userId,
            request.courseId,
            request.certificate.identifier!
        )}.svg`;
    }

    private async getCertificateFromCache(request: GetCertificateRequest): Promise<string> {
        return await this.fileService.readAsText(
            cordova.file.cacheDirectory + 'certificates',
            await this.buildCertificatePersistenceFileName(request)
        );
    }
}
