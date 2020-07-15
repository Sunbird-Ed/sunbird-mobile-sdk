import {Observable} from 'rxjs';
import {ClassRoom} from './class-room';
import {
    ClassRoomAddMemberByIdRequest,
    ClassRoomCreateRequest,
    ClassRoomDeleteByIdRequest,
    ClassRoomGetByIdRequest,
    ClassRoomRemoveMemberByIdRequest,
} from '..';

export interface ClassRoomService {
    create(request: ClassRoomCreateRequest): Observable<ClassRoom>;

    deleteById(request: ClassRoomDeleteByIdRequest): Observable<void>;

    getAll(): Observable<ClassRoom[]>;

    getById(request: ClassRoomGetByIdRequest): Observable<ClassRoom>;

    addMemberById(request: ClassRoomAddMemberByIdRequest): Observable<ClassRoom>;

    removeMemberById(request: ClassRoomRemoveMemberByIdRequest): Observable<void>;
}
