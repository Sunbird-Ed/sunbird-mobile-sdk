export interface ClassRoomCreateRequest {
    name: string;
    board: string;
    medium: string | string[];
    gradeLevel: string | string[];
    subject: string | string[];
}

export interface ClassRoomDeleteByIdRequest {
    id: string;
}

export interface ClassRoomGetByIdRequest {
    id: string;
}

export interface ClassRoomAddMemberByIdRequest {
    memberId: string;
    groupId: string;
}

export interface ClassRoomRemoveMemberByIdRequest {
    memberId: string;
    groupId: string;
}
