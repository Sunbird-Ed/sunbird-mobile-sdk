import {ProfileSession} from './profile-session';

describe('ProfileSession', () => {
    it('should be able to create an instance', () => {
        // act
        const profileSession = new ProfileSession('sample_uid');

        // assert
        expect(profileSession).toBeTruthy();
    });

    it('should be able to serialise in JSON form', () => {
        // arrange
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
