
import { GetPublicKeyHandler } from './get-public-key-handler';
import { of, throwError } from 'rxjs';
import { Container } from 'inversify';
import { CsUserService } from '@project-sunbird/client-services/services/user';
import { CsInjectionTokens } from '../../injection-tokens';
import { CertificateServiceConfig } from '../config/certificate-service-config';
import { ApiConfig, DbService } from '../..';
import { CsCertificateService } from '@project-sunbird/client-services/services/certificate';

describe('GetPublicKeyHandler', () => {
    let getPublicKeyHandler: GetPublicKeyHandler;
    const mockDbService: Partial<DbService> = {};
    const container = new Container();
    const mockCsCertificateService: Partial<CsCertificateService> = {
        getPublicKey: jest.fn()
    };
    const mockCertificateServiceConfig: Partial<CertificateServiceConfig> = {};
    const mockApiConfig: Partial<ApiConfig> = {
        cached_requests: {
            timeToLive: 2 * 60 * 60 * 1000
        }
    };
    beforeAll(() => {
        container.bind<CsCertificateService>(CsInjectionTokens.CERTIFICATE_SERVICE).toConstantValue(mockCsCertificateService as CsCertificateService);
        getPublicKeyHandler = new GetPublicKeyHandler(
            mockDbService as DbService,
            container,
            mockCertificateServiceConfig as CertificateServiceConfig,
            mockApiConfig as ApiConfig
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of GetServerProfileDetailsHandler', () => {
        expect(getPublicKeyHandler).toBeTruthy();
    });

    it('should insert into Db and return the response if already its not available', (done) => {

        mockDbService.read = jest.fn().mockImplementation(() => of([]));
        mockDbService.insert = jest.fn().mockImplementation(() => of(1));
        mockCsCertificateService.getPublicKey = jest.fn().mockImplementation(() => of({
            osid: 'SAMPLE_PUBLIC_KEY'
        }));

        getPublicKeyHandler.handle({ osid: 'SAMPLE_KEY', alg: 'RSA' }).subscribe((response) => {
            // assert
            expect(mockCsCertificateService.getPublicKey).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
            expect(response).toEqual({ osid: 'SAMPLE_PUBLIC_KEY' })
            done();
        });
    });
    it('should return the key if its already available in db and ttl is not expired', (done) => {
        mockDbService.read = jest.fn().mockImplementation(() => of([{
            identifier: 'SAMPLE_OS_ID',
            public_key: 'SAMPLE_PUBLIC_KEY',
            alg: 'RSA',
            osOwner: '',
            expiry_time: Date.now()+1000
        }]));
        mockDbService.update = jest.fn().mockImplementation(() => of(1));
        mockCsCertificateService.getPublicKey = jest.fn().mockImplementation(() => of({
            osid: 'SAMPLE_OS_ID',
            value: 'SAMPLE_PUBLIC_KEY',
            alg: 'RSA',
            osOwner: []
        }));

        getPublicKeyHandler.handle({ osid: 'SAMPLE_KEY', alg: 'RSA' }).subscribe((response) => {
            // assert
            expect(mockCsCertificateService.getPublicKey).not.toHaveBeenCalled();
            expect(response).toEqual({
                osid: 'SAMPLE_OS_ID',
                value: 'SAMPLE_PUBLIC_KEY',
                alg: 'RSA',
                osOwner: []
            })
            done();
        });
    });

    it('should return the update key if its already available in db and ttl is  expired', (done) => {
        mockDbService.read = jest.fn().mockImplementation(() => of([{
            identifier: '',
            public_key: 'SAMPLE_PUBLIC_KEY',
            expiry_time: Date.now() - 1000
        }]));
        mockDbService.update = jest.fn().mockImplementation(() => of(1));
        mockCsCertificateService.getPublicKey = jest.fn().mockImplementation(() => of({
            osid: 'SAMPLE_PUBLIC_KEY'
        }));

        getPublicKeyHandler.handle({ osid: 'SAMPLE_KEY', alg: 'RSA' }).subscribe((response) => {
            // assert
            expect(mockCsCertificateService.getPublicKey).toHaveBeenCalled();
            expect(mockDbService.update).toHaveBeenCalled();
            expect(response).toEqual({ osid: 'SAMPLE_PUBLIC_KEY' })
            done();
        });
    });
});
