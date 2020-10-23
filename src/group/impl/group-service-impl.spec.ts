import {GroupServiceImpl} from './group-service-impl';
import {Container} from 'inversify';
import {CachedItemRequestSourceFrom, CachedItemStore} from '../../key-value-store';
import {
    AddActivitiesRequest,
    AddMembersRequest,
    DeleteByIdRequest,
    GetByIdRequest,
    GroupCreateRequest,
    GroupSearchCriteria,
    RemoveActivitiesRequest,
    RemoveMembersRequest,
    UpdateActivitiesRequest,
    UpdateByIdRequest,
    UpdateMembersRequest
} from '..';
import {of} from 'rxjs';
import { ActivateAndDeactivateByIdRequest } from '../def/requests';
import { CsGroupUpdateGroupGuidelinesRequest } from '@project-sunbird/client-services/services/group';

describe('GroupServiceImpl', () => {
    let groupServiceImpl: GroupServiceImpl;
    const mockContainer: Partial<Container> = {
        get: jest.fn()
    };
    const mockCachedItemStore: Partial<CachedItemStore> = {};

    beforeAll(() => {
        groupServiceImpl = new GroupServiceImpl(
            mockContainer as Container,
            mockCachedItemStore as CachedItemStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of groupServiceImpl', () => {
        expect(groupServiceImpl).toBeTruthy();
    });

    it('should return group create response', (done) => {
        // arrange
        const request: GroupCreateRequest = {
            name: 'sample-group-name',
            description: 'group-des'
        };
        mockContainer.get = jest.fn(() => ({
            create: jest.fn(() => of({}))
        })) as any;
        // act
        groupServiceImpl.create(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    describe('getById', () => {
        it('should return group by invoked getById()', (done) => {
            // arrange
            const request: GetByIdRequest = {
                id: 'sample-id',
                userId: 'sample-userId',
                options: {
                    includeMembers: true,
                    includeActivities: true
                }
            };
            mockCachedItemStore.getCached = jest.fn(() => of({})) as any;
            mockContainer.get = jest.fn(() => ({
                getById: jest.fn(() => of({}))
            })) as any;
            // act
            groupServiceImpl.getById(request).subscribe(() => {
                expect(mockCachedItemStore.getCached).toHaveBeenCalled();
                // expect(mockContainer.get).toHaveBeenCalled();
                done();
            });
        });

        it('should return group by invoked getById() for server', (done) => {
            // arrange
            const request: GetByIdRequest = {
                id: 'sample-id',
                userId: 'sample-userId',
                options: {
                    includeMembers: true,
                    includeActivities: true
                },
                from: CachedItemRequestSourceFrom.SERVER
            };
            mockCachedItemStore.get = jest.fn(() => of({})) as any;
            mockContainer.get = jest.fn(() => ({
                getById: jest.fn(() => of({}))
            })) as any;
            // act
            groupServiceImpl.getById(request).subscribe(() => {
                expect(mockCachedItemStore.get).toHaveBeenCalled();
                //   expect(mockContainer.get).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('search', () => {
        it('should return GroupSearchResponse by invoked search()', (done) => {
            // arrange
            const request: GroupSearchCriteria = {
                filters: {
                    userId: 'sample-uId'
                },
                sort_by: {
                    'order': 'asc',
                },
                limit: 10,
                offset: 10
            } as any;
            mockCachedItemStore.getCached = jest.fn(() => of({})) as any;
            mockContainer.get = jest.fn(() => ({
                getById: jest.fn(() => of({}))
            })) as any;
            // act
            groupServiceImpl.search({ request, undefined } as any).subscribe(() => {
                expect(mockCachedItemStore.getCached).toHaveBeenCalled();
                // expect(mockContainer.get).toHaveBeenCalled();
                done();
            });
        });

        it('should return GroupSearchResponse by invoked search()', (done) => {
            // arrange
            const request: GroupSearchCriteria = {
                filters: {
                    userId: 'sample-uId'
                },
                sort_by: {
                    'order': 'asc',
                },
                limit: 10,
                offset: 10,
            } as any;
            const from = CachedItemRequestSourceFrom.SERVER;
            mockCachedItemStore.get = jest.fn(() => of({})) as any;
            jest.fn(() => {
                mockContainer.get = jest.fn(() => ({
                    getById: jest.fn(() => of({}))
                })) as any;
            });
            // act
            groupServiceImpl.search({ request, from}as any).subscribe(() => {
                expect(mockCachedItemStore.get).toHaveBeenCalled();
                //   expect(mockContainer.get).toHaveBeenCalled();
                done();
            });
        });
    });

    it('should return GroupUpdateResponse by invoked updateById', (done) => {
        // arrange
        const request: UpdateByIdRequest = {
            id: 'sample-id',
            updateRequest: {
                name: 'sample-name'
            }
        };
        mockContainer.get = jest.fn(() => ({
            updateById: jest.fn(() => of({}))
        })) as any;
        // act
        groupServiceImpl.updateById(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should return GroupDeleteResponse by invoked deleteById', (done) => {
        // arrange
        const request: DeleteByIdRequest = {
            id: 'sample-id'
        };
        mockContainer.get = jest.fn(() => ({
            deleteById: jest.fn(() => of({}))
        })) as any;
        // act
        groupServiceImpl.deleteById(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should return GroupAddMembersResponse by invoked addMembers', (done) => {
        // arrange
        const request: AddMembersRequest = {
            groupId: 'sample-group-id',
            addMembersRequest: {
                userId: 'sample-user-id'
            } as any
        };
        mockContainer.get = jest.fn(() => ({
            addMembers: jest.fn(() => of({}))
        })) as any;
        // act
        groupServiceImpl.addMembers(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should return GroupUpdateMembersResponse by invoked updateMembers', (done) => {
        // arrange
        const request: UpdateMembersRequest = {
            groupId: 'sample-group-id',
            updateMembersRequest: {
                userId: 'sample-user-id'
            } as any
        };
        mockContainer.get = jest.fn(() => ({
            updateMembers: jest.fn(() => of({}))
        })) as any;
        // act
        groupServiceImpl.updateMembers(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should return GroupRemoveMembersResponse by invoked removeMembers', (done) => {
        // arrange
        const request: RemoveMembersRequest = {
            groupId: 'sample-group-id',
            removeMembersRequest: {
                userId: 'sample-user-id'
            } as any
        };
        mockContainer.get = jest.fn(() => ({
            removeMembers: jest.fn(() => of({}))
        })) as any;
        // act
        groupServiceImpl.removeMembers(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should return GroupAddActivitiesResponse by invoked addActivities', (done) => {
        // arrange
        const request: AddActivitiesRequest = {
            groupId: 'sample-group-id',
            addActivitiesRequest: {
                userId: 'sample-user-id'
            } as any
        };
        mockContainer.get = jest.fn(() => ({
            addActivities: jest.fn(() => of({}))
        })) as any;
        // act
        groupServiceImpl.addActivities(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should return GroupUpdateActivitiesResponse by invoked updateActivities', (done) => {
        // arrange
        const request: UpdateActivitiesRequest = {
            groupId: 'sample-group-id',
            updateActivitiesRequest: {
                userId: 'sample-user-id'
            } as any
        };
        mockContainer.get = jest.fn(() => ({
            updateActivities: jest.fn(() => of({}))
        })) as any;
        // act
        groupServiceImpl.updateActivities(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should return GroupRemoveActivitiesResponse by invoked removeActivities', (done) => {
        // arrange
        const request: RemoveActivitiesRequest = {
            groupId: 'sample-group-id',
            removeActivitiesRequest: {
                userId: 'sample-user-id'
            } as any
        };
        mockContainer.get = jest.fn(() => ({
            removeActivities: jest.fn(() => of({}))
        })) as any;
        // act
        groupServiceImpl.removeActivities(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    describe('getSupportedActivities()', () => {
        it('should delegate to CsGroupService', (done) => {
            // arrange
            const mockCsGroupService = {
                getSupportedActivities: jest.fn(() => of({}))
            };
            mockContainer.get = jest.fn(() => mockCsGroupService) as any;
            // act
            groupServiceImpl.getSupportedActivities().subscribe(() => {
                expect(mockCsGroupService.getSupportedActivities).toHaveBeenCalled();
                done();
            });
        });
    });

    it('should return GroupSuspendResponse by invoked suspendById', (done) => {
        // arrange
        const request: ActivateAndDeactivateByIdRequest = {
            id: 'sample-id'
        };
        mockContainer.get = jest.fn(() => ({
            suspendById: jest.fn(() => of({}))
        })) as any;
        // act
        groupServiceImpl.suspendById(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should return reactivateResponse by invoked reactivateById', (done) => {
        // arrange
        const request: ActivateAndDeactivateByIdRequest = {
            id: 'sample-id'
        };
        mockContainer.get = jest.fn(() => ({
            reactivateById: jest.fn(() => of({}))
        })) as any;
        // act
        groupServiceImpl.reactivateById(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should return update group guidelines response when updateGroupGuidelines invoked', (done) => {
        // arrange
        const request: CsGroupUpdateGroupGuidelinesRequest = {
            userId: 'sample-id',
            groups: [
                {
                    groupId: 'some_group_id',
                    visited: true
                }
            ]
        };
        mockContainer.get = jest.fn(() => ({
            updateGroupGuidelines: jest.fn(() => of({}))
        })) as any;
        // act
        groupServiceImpl.updateGroupGuidelines(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });
});
