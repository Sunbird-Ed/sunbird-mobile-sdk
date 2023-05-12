import {ProfileSession} from './profile-session';
import {UniqueId} from '../../db/util/unique-id';

describe('ProfileSession', () => {
    let profilesession;
    let mockuid: Partial<string>;

    const mockmanagingSession: Partial<ProfileSession> = {};
    beforeAll(() => {
        jest.spyOn(UniqueId, 'generateUniqueId')
        .mockImplementation(() => 'SECRET')
        profilesession = new ProfileSession(
            mockuid,
            mockmanagingSession as ProfileSession
        );
    })
    it('should be able to create an instance', () => {
        // act
        jest.spyOn(UniqueId, 'generateUniqueId')
        .mockImplementation(() => 'SECRET')
        const profileSession = new ProfileSession('sample_uid');

        // assert
        expect(profileSession).toBeTruthy();
    });

    it('should be able to serialise in JSON form', () => {
        // arrange
        jest.spyOn(UniqueId, 'generateUniqueId')
        .mockImplementation(() => 'SECRET')
        const profileSession = JSON.stringify(new ProfileSession('sample_uid', new ProfileSession('sample_uid_1')));

        // assert
        expect(JSON.parse(profileSession)).toEqual({
            uid: 'sample_uid',
            sid: expect.any(String),
            createdTime: expect.any(Number),
            managedSession: {
                uid: 'sample_uid_1',
                sid: expect.any(String),
                createdTime: expect.any(Number),
            }
        });
    });
});
