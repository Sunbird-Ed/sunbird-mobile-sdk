import {CsMimeType, CsPrimaryCategory, CsContentType} from '@project-sunbird/client-services/services/content';
​
export class CategoryMapper {
  private static readonly CATEGORY_MAP = {
    [CsContentType.CLASSROOM_TEACHING_VIDEO.toLowerCase()]: CsPrimaryCategory.EXPLANATION_CONTENT,
    [CsContentType.CONCEPT_MAP.toLowerCase()]: CsPrimaryCategory.LEARNING_RESOURCE,
    [CsContentType.COURSE.toLowerCase()]: CsPrimaryCategory.ONLINE_COURSE,
    [CsContentType.CURIOSITY_QUESTION_SET.toLowerCase()]: CsPrimaryCategory.QUESTION_SET,
    [CsContentType.E_TEXTBOOK.toLowerCase()]: CsPrimaryCategory.E_TEXTBOOK,
    [CsContentType.EXPERIENTIAL_RESOURCE.toLowerCase()]: CsPrimaryCategory.LEARNING_RESOURCE,
    [CsContentType.EXPLANATION_RESOURCE.toLowerCase()]: CsPrimaryCategory.EXPLANATION_CONTENT,
    [CsContentType.EXPLANATION_VIDEO.toLowerCase()]: CsPrimaryCategory.EXPLANATION_CONTENT,
    [CsContentType.FOCUS_SPOT.toLowerCase()]: CsPrimaryCategory.TEACHER_RESOURCE,
    [CsContentType.LEARNING_OUTCOME_DEFINITION.toLowerCase()]: CsPrimaryCategory.TEACHER_RESOURCE,
    [CsContentType.MARKING_SCHEME_RUBRIC.toLowerCase()]: CsPrimaryCategory.TEACHER_RESOURCE,
    [CsContentType.PEDAGOGY_FLOW.toLowerCase()]: CsPrimaryCategory.TEACHER_RESOURCE,
    [CsContentType.PRACTICE_QUESTION_SET.toLowerCase()]: CsPrimaryCategory.QUESTION_SET,
    [CsContentType.PRACTICE_RESOURCE.toLowerCase()]: CsPrimaryCategory.QUESTION_SET,
    [CsContentType.READING_MATERIAL.toLowerCase()]: CsPrimaryCategory.LEARNING_RESOURCE,
    [CsContentType.SELF_ASSESS.toLowerCase()]: CsPrimaryCategory.COURSE_ASSESSMENT,
    [CsContentType.TEACHING_METHOD.toLowerCase()]: CsPrimaryCategory.TEACHER_RESOURCE,
    [CsContentType.TEXTBOOK.toLowerCase()]: CsPrimaryCategory.ETB,
    [CsContentType.COLLECTION.toLowerCase()]: CsPrimaryCategory.CONTENT_PLAYLIST,
    [CsContentType.EXPLANATION_READING_MATERIAL.toLowerCase()]: CsPrimaryCategory.LEARNING_RESOURCE,
    [CsContentType.LEARNING_ACTIVITY.toLowerCase()]: CsPrimaryCategory.LEARNING_RESOURCE,
    [CsContentType.LESSON_PLAN.toLowerCase()]: CsPrimaryCategory.GENERIC_COLLECTION,
    [CsContentType.LESSON_PLAN_RESOURCE.toLowerCase()]: CsPrimaryCategory.TEACHER_RESOURCE,
    [CsContentType.PREVIOUS_BOARD_EXAM_PAPERS.toLowerCase()]: CsPrimaryCategory.LEARNING_RESOURCE,
  };
​
​
  public static getPrimaryCategory(contentType: string, mimeType: string): string {
    if (contentType && contentType.toLowerCase() === CsContentType.RESOURCE.toLowerCase()) {
      switch (mimeType) {
        case  CsMimeType.VIDEO:
        case  CsMimeType.YOUTUBE:
          return CsPrimaryCategory.EXPLANATION_CONTENT;
        case  CsMimeType.PDF:
        case  CsMimeType.H5P:
        case  CsMimeType.HTML:
        case  CsMimeType.ECML:
          return CsPrimaryCategory.LEARNING_RESOURCE;
        default:
          return contentType;
      }
    }
    return CategoryMapper.CATEGORY_MAP[contentType] || contentType;
  }
​
}
