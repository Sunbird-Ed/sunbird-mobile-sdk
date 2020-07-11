import {GroupService} from '..';
import {GroupServiceImpl} from './group-service-impl';
import {Container} from 'inversify';
import {CsInjectionTokens, InjectionTokens} from '../../injection-tokens';
import {CachedItemStore} from '../../key-value-store';
import {CsGroupService} from '@project-sunbird/client-services/services/group';

describe('GroupServiceImpl', () => {
    let groupService: GroupService;
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockCsGroupService: Partial<CsGroupService> = {};

    beforeAll(() => {
        const container = new Container();

        container.bind<Container>(InjectionTokens.CONTAINER).toConstantValue(container);
        container.bind<CachedItemStore>(InjectionTokens.CACHED_ITEM_STORE).toConstantValue(mockCachedItemStore as CachedItemStore);
        container.bind<CsGroupService>(CsInjectionTokens.GROUP_SERVICE).toConstantValue(mockCsGroupService as CsGroupService);

        container.bind<GroupService>(InjectionTokens.GROUP_SERVICE).to(GroupServiceImpl).inSingletonScope();

        groupService = container.get<GroupService>(InjectionTokens.GROUP_SERVICE);
    });

    beforeEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    it('should be able to get an instance from container', () => {
        expect(groupService).toBeTruthy();
    });

    describe('activityService', () => {
        it('should be able to access activityService', () => {
            expect(groupService.activityService).toBeTruthy();
        });
    });
});
