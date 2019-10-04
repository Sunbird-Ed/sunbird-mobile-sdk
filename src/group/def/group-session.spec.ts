import {UniqueId} from '../../db/util/unique-id';
import { GroupSession } from '..';
describe('GroupSession', () => {
    const gid = 'SAMPLE_GID';
    const sid = UniqueId.generateUniqueId();
    const createdTime = Date.now();
    let groupSession: GroupSession;
    beforeAll(() => {
        groupSession = new GroupSession(gid);
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return an instance of GetFrameworkDetailsHandler', () => {
        expect(groupSession).toBeTruthy();
    });

    it('should get gid', () => {
      // arrange
      const _gid = 'SAMPLE_GID';
      // act

      spyOn(groupSession, 'gid').and.returnValue('SAMPLE_GID');
      expect(gid).toBe(_gid);
    });

    it('should get sid', () => {
        // arrange
        const _sid = UniqueId.generateUniqueId();
        // act
        spyOn(groupSession, 'sid').and.returnValue(UniqueId.generateUniqueId);
        expect(sid).toBe(_sid);
      });

      it('should get createdTime', () => {
        // arrange
        const _createdTime = Date.now();
        // act
        spyOn(groupSession, 'createdTime').and.returnValue(Date.now());
        expect(createdTime).toBe(_createdTime);
      });
});
