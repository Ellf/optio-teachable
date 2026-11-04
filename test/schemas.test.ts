import { describe, expect, it } from 'vitest';
import {
    BasicUserSchema,
    CourseDetailResponseSchema,
    CourseProgressResponseSchema,
    CoursesResponseSchema,
    EnrolmentsResponseSchema,
    KNOWN_LECTURE_ATTACHMENT_KINDS,
    LectureAttachmentSchema,
    LectureDetailResponseSchema,
    LectureQuizResponseSchema,
    LectureVideoResponseSchema,
    PricingPlanDetailResponseSchema,
    PricingPlansResponseSchema,
    QuizIdsResponseSchema,
    QuizQuestionSchema,
    QuizResponsesResponseSchema,
    TransactionsResponseSchema,
    UserDetailSchema,
    UserSearchResponseSchema,
    WebhookEventsResponseSchema,
    WebhooksResponseSchema,
    isKnownAttachmentKind,
} from '../src';
import * as fx from './fixtures';

describe('sample responses parse', () => {
    it.each([
        ['UserSearchResponseSchema', UserSearchResponseSchema, fx.userList],
        ['UserDetailSchema', UserDetailSchema, fx.userDetail],
        ['TransactionsResponseSchema', TransactionsResponseSchema, fx.transactions],
        ['CoursesResponseSchema', CoursesResponseSchema, fx.courseList],
        ['CourseDetailResponseSchema', CourseDetailResponseSchema, fx.courseDetail],
        ['EnrolmentsResponseSchema', EnrolmentsResponseSchema, fx.enrolments],
        ['LectureDetailResponseSchema', LectureDetailResponseSchema, fx.lectureDetail],
        ['CourseProgressResponseSchema', CourseProgressResponseSchema, fx.courseProgress],
        ['QuizIdsResponseSchema', QuizIdsResponseSchema, fx.quizIds],
        ['LectureQuizResponseSchema', LectureQuizResponseSchema, fx.lectureQuiz],
        ['QuizResponsesResponseSchema', QuizResponsesResponseSchema, fx.quizResponses],
        ['LectureVideoResponseSchema', LectureVideoResponseSchema, fx.lectureVideo],
        ['WebhooksResponseSchema', WebhooksResponseSchema, fx.webhooks],
        ['WebhookEventsResponseSchema', WebhookEventsResponseSchema, fx.webhookEvents],
        ['PricingPlansResponseSchema', PricingPlansResponseSchema, fx.pricingPlans],
        ['PricingPlanDetailResponseSchema', PricingPlanDetailResponseSchema, fx.pricingPlanDetail],
    ] as const)('%s', (_name, schema, sample) => {
        const result = schema.safeParse(sample);
        expect(result.error?.issues).toBeUndefined();
        expect(result.success).toBe(true);
    });
});

describe('list responses', () => {
    it('accept an empty list with no meta', () => {
        expect(UserSearchResponseSchema.safeParse({ users: [] }).success).toBe(true);
        expect(TransactionsResponseSchema.safeParse({ transactions: [] }).success).toBe(true);
    });

    it('reject a missing list', () => {
        expect(UserSearchResponseSchema.safeParse({ meta: fx.meta }).success).toBe(false);
    });
});

describe('users', () => {
    it('rejects an invalid email in a user list', () => {
        expect(BasicUserSchema.safeParse({ id: 1, email: 'not-an-email' }).success).toBe(false);
    });

    it('accepts a user with no name', () => {
        expect(BasicUserSchema.safeParse({ id: 1, email: 'a@example.com' }).success).toBe(true);
        expect(BasicUserSchema.safeParse({ id: 1, email: 'a@example.com', name: null }).success).toBe(true);
    });
});

describe('lecture attachments', () => {
    const base = { id: 1, name: null, position: 1 };

    it.each(KNOWN_LECTURE_ATTACHMENT_KINDS)('accepts the known kind "%s"', (kind) => {
        expect(LectureAttachmentSchema.safeParse({ ...base, kind }).success).toBe(true);
    });

    // Teachable sends kinds it doesn't document. These used to fail validation (v1.0.2, v1.1.0).
    it('accepts an undocumented kind', () => {
        const result = LectureAttachmentSchema.safeParse({ ...base, kind: 'something_new' });
        expect(result.success).toBe(true);
        expect(result.data?.kind).toBe('something_new');
    });

    it('rejects a kind that is not a string', () => {
        expect(LectureAttachmentSchema.safeParse({ ...base, kind: 42 }).success).toBe(false);
        expect(LectureAttachmentSchema.safeParse({ ...base }).success).toBe(false);
    });

    it('isKnownAttachmentKind tells known kinds from unknown ones', () => {
        expect(isKnownAttachmentKind('pdf_embed')).toBe(true);
        expect(isKnownAttachmentKind('video')).toBe(true);
        expect(isKnownAttachmentKind('something_new')).toBe(false);
    });
});

describe('quizzes', () => {
    it('only accepts single or multiple question types', () => {
        expect(QuizQuestionSchema.safeParse({ ...fx.quizQuestion, question_type: 'multiple' }).success).toBe(true);
        expect(QuizQuestionSchema.safeParse({ ...fx.quizQuestion, question_type: 'essay' }).success).toBe(false);
    });

    it('requires a lecture quiz to have kind "quiz"', () => {
        const wrongKind = { quiz: { ...fx.lectureQuiz.quiz, kind: 'video' } };
        expect(LectureQuizResponseSchema.safeParse(wrongKind).success).toBe(false);
    });
});

describe('course progress', () => {
    it('requires the certificate object, even when every field is null', () => {
        const { certificate: _, ...noCertificate } = fx.courseProgress.course_progress;
        expect(CourseProgressResponseSchema.safeParse({ course_progress: noCertificate }).success).toBe(false);
    });
});

describe('transactions', () => {
    it('requires amounts to be numbers', () => {
        const bad = { transactions: [{ ...fx.transactions.transactions[0], charge: '49.00' }] };
        expect(TransactionsResponseSchema.safeParse(bad).success).toBe(false);
    });
});
