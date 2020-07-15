import {inject, injectable} from 'inversify';
import {
    ClassRoomAddMemberByIdRequest,
    ClassRoomCreateRequest,
    ClassRoomDeleteByIdRequest,
    ClassRoomGetByIdRequest,
    ClassRoomRemoveMemberByIdRequest,
    ClassRoomService
} from '..';
import {Observable} from 'rxjs';
import {ClassRoom} from '../def/class-room';
import {CsInjectionTokens} from '../../injection-tokens';
import {CsGroupService} from '@project-sunbird/client-services/services/group';

@injectable()
export class ClassRoomServiceImpl implements ClassRoomService {
    constructor(@inject(CsInjectionTokens.GROUP_SERVICE) private groupService: CsGroupService) {
    }

    create({name, board, medium, gradeLevel, subject}: ClassRoomCreateRequest): Observable<ClassRoom> {
        return this.groupService.create(
            name,
            board,
            medium,
            gradeLevel,
            subject
        );
    }

    getById({id}: ClassRoomGetByIdRequest): Observable<ClassRoom> {
        return this.groupService.getById(id);
    }

    getAll(): Observable<ClassRoom[]> {
        return this.groupService.getAll();
    }

    deleteById({id}: ClassRoomDeleteByIdRequest): Observable<void> {
        return this.groupService.deleteById(id);
    }

    addMemberById({memberId, groupId}: ClassRoomAddMemberByIdRequest): Observable<ClassRoom> {
        return this.groupService.addMemberById(memberId, groupId);
    }

    removeMemberById({memberId, groupId}: ClassRoomRemoveMemberByIdRequest): Observable<void> {
        return this.groupService.removeMemberById(memberId, groupId);
    }
}
