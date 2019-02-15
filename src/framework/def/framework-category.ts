export enum FrameworkCategory {
    BOARD = 'board',
    MEDIUM = 'medium',
    GRADE_LEVEL = 'gradeLevel',
    SUBJECT = 'subject',
    TOPIC = 'topic',
    PURPOSE = 'purpose'
}

export class FrameworkCategoriesGroups {
    public static readonly DEFAULT_FRAMEWORK_CATEGORIES = [
        FrameworkCategory.BOARD,
        FrameworkCategory.MEDIUM,
        FrameworkCategory.GRADE_LEVEL,
        FrameworkCategory.SUBJECT
    ];

    public static readonly COURSE_FRAMEWORK_CATEGORIES = [
        FrameworkCategory.TOPIC,
        FrameworkCategory.PURPOSE,
        FrameworkCategory.MEDIUM,
        FrameworkCategory.GRADE_LEVEL,
        FrameworkCategory.SUBJECT
    ];
}
