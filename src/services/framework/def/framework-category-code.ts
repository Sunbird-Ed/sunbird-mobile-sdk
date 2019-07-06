export enum FrameworkCategoryCode {
    BOARD = 'board',
    MEDIUM = 'medium',
    GRADE_LEVEL = 'gradeLevel',
    SUBJECT = 'subject',
    TOPIC = 'topic',
    PURPOSE = 'purpose'
}

export class FrameworkCategoryCodesGroup {
    public static readonly DEFAULT_FRAMEWORK_CATEGORIES = [
        FrameworkCategoryCode.BOARD,
        FrameworkCategoryCode.MEDIUM,
        FrameworkCategoryCode.GRADE_LEVEL,
        FrameworkCategoryCode.SUBJECT
    ];

    public static readonly COURSE_FRAMEWORK_CATEGORIES = [
        FrameworkCategoryCode.TOPIC,
        FrameworkCategoryCode.PURPOSE,
        FrameworkCategoryCode.MEDIUM,
        FrameworkCategoryCode.GRADE_LEVEL,
        FrameworkCategoryCode.SUBJECT
    ];
}
