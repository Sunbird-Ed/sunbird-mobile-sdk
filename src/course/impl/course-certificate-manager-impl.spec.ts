import {defer, iif, Observable, of, throwError} from 'rxjs';
import {ProfileService} from '../../profile';
import {FileService} from '../../util/file/def/file-service';
import {KeyValueStore} from '../../key-value-store';
import {CsCourseService} from '@project-sunbird/client-services/services/course';
import {CourseCertificateManagerImpl} from './course-certificate-manager-impl';

describe('CourseCertificateManagerImpl', () => {
    class InMemoryKeyValueStore implements KeyValueStore {
        private store = new Map<string, string>();
        
        getValue(key: string): Observable<string | undefined> {
            return iif(
                () => this.store.has(key),
                defer(() => of(this.store.get(key))),
                defer(() => of(undefined)),
            );
        }

        setValue(key: string, value: string): Observable<boolean> {
            return defer(() => {
                this.store.set(key, value);
                return of(true);
            });
        }
    }
    
    let courseCertificateManager: CourseCertificateManagerImpl;
    const mockProfileService: Partial<ProfileService> = {
        getActiveProfileSession: jest.fn().mockImplementation(() => {
            return of({
                uid: 'SOME_UID',
                sid: 'SOME_SESSION_ID',
                createdTime: Date.now()
            });
        })
    };
    const mockFileService: Partial<FileService> = {
        writeFile: jest.fn().mockImplementation(() => {
            return Promise.resolve('SOME_PATH');
        }),
        exists: jest.fn().mockImplementation(() => {
        }),
        getTempLocation: jest.fn().mockImplementation(() => {
        })
    };
    const mockCsCourseService: Partial<CsCourseService> = {
        getSignedCourseCertificate: jest.fn().mockImplementation(() => {
            return of({
                printUri: '<svg>SAMPLE_SVG_CERTIFICATE</svg>'
            });
        })
    };
    const mockKeyValueStore = new InMemoryKeyValueStore();
    
    beforeAll(() => {
        courseCertificateManager = new CourseCertificateManagerImpl(
            mockProfileService as ProfileService,
            mockFileService as FileService,
            mockKeyValueStore as KeyValueStore,
            mockCsCourseService as CsCourseService
        );
    });

    it('should be able to create an instance', () => {
        expect(courseCertificateManager).toBeTruthy();
    });

    describe('isCertificateCached', () => {
        it('should resolve false if not cached in KeyValueStore', async () => {
            // arrange
            const request = {
                courseId: 'SOME_COURSE_ID',
                certificate: {
                    identifier: 'SOME_IDENTIFIER',
                    url: 'SOME_URL',
                    id: 'SOME_ID',
                    name: 'SOME_NAME',
                    lastIssuedOn: 'SOME_DATE',
                    token: 'SOME_TOKEN',
                }
            };

            // act
            await mockKeyValueStore.setValue(`certificate_${request.certificate.identifier}_${request.courseId}_${'SOME_UID'}`, '').toPromise();
            const result = await courseCertificateManager.isCertificateCached(request).toPromise();

            // assert
            expect(result).toBeFalsy();
        });

        it('should resolve true if cached in KeyValueStore', async () => {
            // arrange
            const request = {
                courseId: 'SOME_COURSE_ID',
                certificate: {
                    identifier: 'SOME_IDENTIFIER',
                    url: 'SOME_URL',
                    id: 'SOME_ID',
                    name: 'SOME_NAME',
                    lastIssuedOn: 'SOME_DATE',
                    token: 'SOME_TOKEN',
                }
            };

            // act
            await mockKeyValueStore.setValue(`certificate_${request.certificate.identifier}_${request.courseId}_${'SOME_UID'}`, '').toPromise();
            await courseCertificateManager.getCertificate(request).toPromise();
            const result = await courseCertificateManager.isCertificateCached(request).toPromise();

            // assert
            expect(result).toBeTruthy();
        });
    });

    describe('getCertificate', () => {
        // arrange
        const request = {
            courseId: 'SOME_COURSE_ID',
            certificate: {
                identifier: 'SOME_IDENTIFIER',
                url: 'SOME_URL',
                id: 'SOME_ID',
                name: 'SOME_NAME',
                lastIssuedOn: 'SOME_DATE',
                token: 'SOME_TOKEN',
            }
        };

        describe('when fetch successful', () => {
            it('should cache svg to keyValueStore', async (done) => {
                // arrange
                spyOn(mockKeyValueStore, 'setValue').and.callThrough();

                // act
                await courseCertificateManager.getCertificate(request).toPromise();

                // assert
                setTimeout(() => {
                    expect(mockKeyValueStore.setValue).toHaveBeenCalledWith(
                        `certificate_${request.certificate.identifier}_${request.courseId}_${'SOME_UID'}`,
                        expect.any(String)
                    );
                    done();
                });
            });
        });

        describe('when fetch fails', () => {
            it('should attempt to fetch from cache', async (done) => {
                // arrange
                await mockKeyValueStore.setValue(`certificate_${request.certificate.identifier}_${request.courseId}_${'SOME_UID'}`, '').toPromise();
                spyOn(mockKeyValueStore, 'setValue').and.callThrough();
                spyOn(mockKeyValueStore, 'getValue').and.callThrough();
                spyOn(mockCsCourseService, 'getSignedCourseCertificate').and.returnValue(throwError(new Error('UNKNOWN_ERROR')));

                // act
                try {
                    await courseCertificateManager.getCertificate(request).toPromise();
                    fail();
                } finally {
                    // assert
                    expect(mockKeyValueStore.setValue).not.toHaveBeenCalled();
                    expect(mockKeyValueStore.getValue).toHaveBeenCalled();
                    done();
                }
            });
        });
    });

    describe('downloadCertificate', () => {
        it('should be able to download a certificate to the "Downloads" directory', async () => {
            // arrange
            const request = {
                fileName: 'SOME_FILE_NAME',
                mimeType: 'application/pdf',
                blob: new Blob()
            };

            // act
            await courseCertificateManager.downloadCertificate({
                fileName: 'SOME_FILE_NAME',
                mimeType: 'application/pdf',
                blob: new Blob()
            }).toPromise();

            // assert
            expect(mockFileService.writeFile).toHaveBeenCalledWith(
                cordova.file.externalDataDirectory , request.fileName, request.blob,
                {replace: true}
            );
        });
    });
});
