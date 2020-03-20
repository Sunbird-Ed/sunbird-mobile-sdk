import {FormServiceImpl} from './form-service-impl';
import {mockSdkConfigWithFormServiceConfig} from './form-service-impl.spec.data';
import {ApiService} from '../../api';
import {FileService} from '../../util/file/def/file-service';
import {CachedItemStore} from '../../key-value-store';
import {SdkConfig} from '../../sdk-config';
import {Container} from 'inversify';
import {FormRequest, FormService} from '..';
import {InjectionTokens} from '../../injection-tokens';
import {GetFormHandler} from '../handle/get-form-handler';
import {of} from 'rxjs';

jest.mock('../handle/get-form-handler');


describe('FormServiceImpl', () => {
    let formService: FormService;

    const container = new Container();

    const mockApiService: Partial<ApiService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockFileService: Partial<FileService> = {};


    beforeAll(() => {
        container.bind<FormService>(InjectionTokens.FORM_SERVICE).to(FormServiceImpl);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfigWithFormServiceConfig as SdkConfig);
        container.bind<ApiService>(InjectionTokens.API_SERVICE).toConstantValue(mockApiService as ApiService);
        container.bind<FileService>(InjectionTokens.FILE_SERVICE).toConstantValue(mockFileService as FileService);
        container.bind<CachedItemStore>(InjectionTokens.CACHED_ITEM_STORE).toConstantValue(mockCachedItemStore as CachedItemStore);

        formService = container.get<FormService>(InjectionTokens.FORM_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // @ts-ignore
        (GetFormHandler as jest.Mock<GetFormHandler>).mockClear();
    });

    it('should return instance from the container', () => {
        expect(formService).toBeTruthy();
    });

    it('should return form when getForm() called', (done) => {
        // arrange
        const request: FormRequest = {
            type: 'sample_type',
            subType: 'sample_subType',
            action: 'sample_action',
            rootOrgId: 'sample_rootOrgId',
            framework: 'sample_framework'
        };
        // @ts-ignore
        (GetFormHandler as jest.Mock<GetFormHandler>).mockImplementation(
            () => ({
                handle: () => of({
                    body: {
                        result: 'sample_response'
                    }
                })
            } as Partial<GetFormHandler> as GetFormHandler)
        );
        // act
        formService.getForm(request).subscribe(() => {
            expect(GetFormHandler).toHaveBeenCalled();
            done();
        });
        // assert
    });
});
