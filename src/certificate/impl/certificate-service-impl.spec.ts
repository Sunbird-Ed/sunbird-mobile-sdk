import { Container } from 'inversify';
import { of, throwError } from 'rxjs';
import { DbService, SdkConfig, ProfileService, KeyValueStore, DownloadStatus } from '../..';
import { FileService } from '../../util/file/def/file-service';
import { CertificateServiceImpl } from './certificate-service-impl';
import { CsCertificateService, GetPublicKeyRequest, GetPublicKeyResponse } from '@project-sunbird/client-services/services/certificate';
import { CsInjectionTokens } from '../../injection-tokens';
import { GetPublicKeyHandler } from '../handlers/get-public-key-handler';

jest.mock('../handlers/get-public-key-handler');

describe('CertificateServiceImpl', () => {
    let certificateServiceImpl: CertificateServiceImpl;
    const container = new Container();
    const mockCsCertificateService: Partial<CsCertificateService> = {
        fetchCertificates: jest.fn(() => of({ certRegCount: 1 }) as any)
    };
    const mockDbService: Partial<DbService> = {};
    const mockFileService: Partial<FileService> = {};
    const mockKeyValueStore: Partial<KeyValueStore> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockSdkConfig: Partial<SdkConfig> = {};

    beforeAll(() => {
        certificateServiceImpl = new CertificateServiceImpl(
            container,
            mockDbService as DbService,
            mockSdkConfig as SdkConfig,
            mockProfileService as ProfileService,
            mockKeyValueStore as KeyValueStore,
            mockFileService as FileService
        );
        container.bind<CsCertificateService>(CsInjectionTokens.CERTIFICATE_SERVICE).
            toConstantValue(mockCsCertificateService as CsCertificateService);
    });

    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
        (GetPublicKeyHandler as jest.Mock<GetPublicKeyHandler>).mockClear();
        window['device'] = { uuid: 'some_uuid', platform: 'android' };
    });

    it('should be create a instance of certificateServiceImpl', () => {
        expect(certificateServiceImpl).toBeTruthy();
    });

    it('should return the certificate details', (done) => {
        const req = {
            userId: 'user-id',
            schemaName: 'name',
            size: 3
        };
        mockCsCertificateService.fetchCertificates = jest.fn(() => of({ certRegCount: 1 }) as any);
        certificateServiceImpl.getCertificates(req).subscribe((res) => {
            expect(mockCsCertificateService.fetchCertificates).toHaveBeenCalled();
            done();
        });
    });

    it('should be invoked GetPublicKeyHandler', (done) => {
        const res: GetPublicKeyResponse = {
            osid: 'osid',
            value: 'value',
            alg: 'alg',
            osOwner: ['os']
        };
        (GetPublicKeyHandler as jest.Mock<GetPublicKeyHandler>).mockImplementation(() => {
            return {
                handle: jest.fn(() => of(res))
            } as any;
        });
        const req: GetPublicKeyRequest = {
            osid: 'osid',
            alg: '',
            schemaName: ''
        };
        certificateServiceImpl.getPublicKey(req).subscribe((data) => {
            expect(data).toBe(res);
            done();
        });
    });

    describe('getCertificate', () => {
        it('should be return a certificate', (done) => {
            mockCsCertificateService.getCerificateDownloadURI = jest.fn(() => of({
                printUri: 'sample-uri'
            }));
            const courseCertificate = {
                identifier: 'do-123',
                type: 'CERTIFICATE_REGISTRY',
                templateUrl: 'sample-url'
            } as any;
            const request = {
                courseId: 'sample-course-id',
                certificate: courseCertificate
            };
            mockKeyValueStore.setValue = jest.fn(() => of(true));
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                managedSession: {
                    uid: 'sample-uid'
                }
            } as any));
            certificateServiceImpl.getCertificate(request).subscribe(() => {
                expect(mockCsCertificateService.getCerificateDownloadURI).toHaveBeenCalled();
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                done();
            });
        });

        it('should not be return a certificate for catch part', (done) => {
            mockCsCertificateService.getCerificateDownloadURI = jest.fn(() => throwError({
                error: 'sample-error'
            }));
            const courseCertificate = {
                identifier: 'do-123',
                type: 'CERTIFICATE_REGISTRY',
                templateUrl: 'sample-url'
            } as any;
            const request = {
                courseId: 'sample-course-id',
                certificate: courseCertificate
            };
            mockKeyValueStore.getValue = jest.fn(() => of({ data: 'certificate_do-123_1' } as any));
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                managedSession: {
                    uid: 'sample-uid'
                }
            } as any));
            certificateServiceImpl.getCertificate(request).toPromise().catch(() => {
                expect(mockCsCertificateService.getCerificateDownloadURI).toHaveBeenCalled();
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                expect(mockKeyValueStore.getValue).toHaveBeenCalled();
                done();
            });
        });
    });

    it('should be download a certificate', (done) => {
        // arrange
        const req = {
            fileName: 'sample-cer',
            mimeType: 'certificate',
        } as any;
        mockFileService.writeFile = jest.fn(() => Promise.resolve('certificate'));
        certificateServiceImpl.downloadCertificate(req).subscribe(() => {
            expect(mockFileService.writeFile).toHaveBeenCalled();
            done();
        });
    });

    describe('downloadLegacyeCertificate', () => {
        it('should be successfully download the certificate', (done) => {
            // arrange
            const courseCertificate = {
                identifier: 'do-123',
                type: 'CERTIFICATE_REGISTRY',
                templateUrl: 'sample-url',
                name: 'sample-certificate',
                url: 'sample-url',
                token: 'token'
            } as any;
            const request = {
                courseId: 'sample-course-id',
                certificate: courseCertificate
            };
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                managedSession: {
                    uid: 'sample-uid'
                }
            } as any));
            window['downloadManager'] = {
                enqueue: jest.fn((_, fn) => fn(undefined, { id: 'sample-id' })),
                query: jest.fn((_, fn) => fn(undefined, [{
                    status: DownloadStatus.STATUS_SUCCESSFUL,
                    localUri: 'http//:sample-path/do_id/fileName'
                }]))
            } as any;
            mockCsCertificateService.getLegacyCerificateDownloadURI = jest.fn(() => of({ signedUrl: 'url' }));
            certificateServiceImpl.downloadLegacyeCertificate(request).subscribe(() => {
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                expect(mockCsCertificateService.getLegacyCerificateDownloadURI).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('isCertificateCached', () => {
        it('should return certificate from cache if available', (done) => {
            const courseCertificate = {
                identifier: 'do-123',
                type: 'CERTIFICATE_REGISTRY',
                templateUrl: 'sample-url',
                name: 'sample-certificate',
                url: 'sample-url',
                token: 'token'
            } as any;
            const request = {
                courseId: 'sample-course-id',
                certificate: courseCertificate
            };
            mockKeyValueStore.getValue = jest.fn(() => of({ data: 'certificate_do-123_1' } as any));
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                managedSession: {
                    uid: 'sample-uid'
                }
            } as any));
            certificateServiceImpl.isCertificateCached(request).subscribe(() => {
                expect(mockKeyValueStore.getValue).toHaveBeenCalled();
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                done();
            });
        });

        it('should not return certificate from cache if it is not available', (done) => {
            const courseCertificate = {
                identifier: 'do-123',
                type: 'CERTIFICATE_REGISTRY',
                templateUrl: 'sample-url',
                name: 'sample-certificate',
                url: 'sample-url',
                token: 'token'
            } as any;
            const request = {
                courseId: 'sample-course-id',
                certificate: courseCertificate
            };
            mockKeyValueStore.getValue = jest.fn(() => throwError({ error: 'certificate_do-123_1' } as any));
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                managedSession: {
                    uid: 'sample-uid'
                }
            } as any));
            certificateServiceImpl.isCertificateCached(request).toPromise().then(() => {
                expect(mockKeyValueStore.getValue).toHaveBeenCalled();
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                done();
            });
        });
    });

    it('should return encoded data', (done) => {
        const request = 'decode_data';
        mockCsCertificateService.getEncodedData = jest.fn(() => Promise.resolve('coded_data'));
        certificateServiceImpl.getEncodedData(request);
        setTimeout(() => {
            expect(mockCsCertificateService.getEncodedData).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should verified certificate', (done) => {
        const request = {
            publicKey: 'key',
            certificateData: {},
            schemaName: 'name',
            certificateId: 'id'
        };
        mockCsCertificateService.verifyCertificate = jest.fn(() => of({} as any));
        certificateServiceImpl.verifyCertificate(request).subscribe(() => {
            expect(mockCsCertificateService.verifyCertificate).toHaveBeenCalled();
            done();
        });
    });
});
