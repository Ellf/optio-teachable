import { z } from 'zod';

/**
 * @module schemas
 * @description Zod schemas for validating and inferring types from the Teachable v1 API.
 * All schemas are exported so consuming applications can use them directly
 * for runtime validation and static type inference via `z.infer<typeof Schema>`.
 */

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

/**
 * Standard pagination metadata returned by Teachable list endpoints.
 */
/** @hidden */
export const PaginationMetaSchema = z.object({
    total: z.number().optional(),
    page: z.number().optional(),
    from: z.number().optional(),
    to: z.number().optional(),
    per_page: z.number().optional(),
    number_of_pages: z.number().optional(),
});

/** Inferred TypeScript type for {@link PaginationMetaSchema}. */
export interface PaginationMeta extends z.infer<typeof PaginationMetaSchema> {}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

/**
 * A basic user object as returned in search result lists.
 * Name may be null as Teachable does not always populate this field.
 */
/** @hidden */
export const BasicUserSchema = z.object({
    id: z.number(),
    email: z.email(),
    name: z.string().nullable().optional(),
});

/** Inferred TypeScript type for {@link BasicUserSchema}. */
export interface BasicUser extends z.infer<typeof BasicUserSchema> {}

/**
 * The paginated wrapper object returned by Teachable user search endpoints.
 * Contains an array of basic users and optional pagination metadata.
 */
/** @hidden */
export const UserSearchResponseSchema = z.object({
    users: z.array(BasicUserSchema),
    meta: PaginationMetaSchema.optional(),
});

/** Inferred TypeScript type for {@link UserSearchResponseSchema}. */
export interface UserSearchResponse extends z.infer<typeof UserSearchResponseSchema> {}

/**
 * A detailed user object as returned from the `/users/:id` endpoint.
 * Includes role, sign-in metadata, and an optional list of course enrolments.
 */
/** @hidden */
export const UserDetailSchema = z.object({
    id: z.number(),
    email: z.string(),
    name: z.string().nullable().optional(),
    role: z.string().optional(),
    last_sign_in_at: z.string().nullable().optional(),
    sign_in_count: z.number().optional(),
    courses: z.array(z.object({
        course_id: z.number().optional(),
        course_name: z.string().optional(),
        name: z.string().optional(),
        enrolled_at: z.string().nullable().optional(),
        percent_complete: z.number().optional(),
        completed_at: z.string().nullable().optional(),
        is_active_enrollment: z.boolean().optional(),
    })).optional(),
});

/** Inferred TypeScript type for {@link UserDetailSchema}. */
export interface UserDetail extends z.infer<typeof UserDetailSchema> {}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

/**
 * A single transaction object as returned by the Teachable v1 API.
 *
 * Financial fields (`charge`, `final_price`, `tax_charge` etc.) are returned
 * as integers representing the smallest currency unit (e.g. cents), so a value
 * of `66045` represents $660.45.
 *
 * Several fields are nullable as Teachable may omit or null them depending
 * on the transaction type (e.g. refunds, affiliate transactions, chargebacks).
 */
/** @hidden */
export const TransactionSchema = z.object({
    id: z.number(),
    user_id: z.number(),
    pricing_plan_id: z.number().optional(),
    sale_id: z.number().optional(),

    // Timestamps
    created_at: z.string(),
    purchased_at: z.string().optional(),
    refunded_at: z.string().nullable().optional(),

    // Financials
    charge: z.number(),
    final_price: z.number(),
    tax_charge: z.number().optional(),
    revenue: z.number().optional(),
    amount_refunded: z.number().optional(),
    chargeback_fee: z.number().nullable().optional(),
    affiliate_fees: z.number().nullable().optional(),
    author_fees: z.number().nullable().optional(),

    // Metadata
    currency: z.string(),
    status: z.string().nullable().optional(),
    has_chargeback: z.boolean().nullable().optional(),

    // Relations
    coupon_id: z.number().nullable().optional(),
    affiliate_id: z.number().nullable().optional(),
    author_id: z.number().nullable().optional(),
});

/** Inferred TypeScript type for {@link TransactionSchema}. */
export interface Transaction extends z.infer<typeof TransactionSchema> {}

/**
 * The paginated wrapper object returned by Teachable transaction endpoints.
 * Includes full pagination metadata: total records, current page, page range,
 * results per page, and total number of pages.
 */
/** @hidden */
export const TransactionsResponseSchema = z.object({
    transactions: z.array(TransactionSchema),
    meta: PaginationMetaSchema.optional(),
});

/** Inferred TypeScript type for {@link TransactionsResponseSchema}. */
export interface TransactionsResponse extends z.infer<typeof TransactionsResponseSchema> {}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

/**
 * A summary course object as returned in paginated list responses.
 * Uses `z.looseObject` to allow undocumented fields from the Teachable
 * API to pass through without causing validation failures.
 */
/** @hidden */
export const CourseSchema = z.looseObject({
    id: z.number(),
    name: z.string().nullable().optional(),
    heading: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    is_published: z.boolean().nullable().optional(),
    image_url: z.string().nullable().optional(),
});

/** Inferred TypeScript type for {@link CourseSchema}. */
export interface Course extends z.infer<typeof CourseSchema> {}

/**
 * A single lecture section within a course, containing an ordered
 * list of lectures.
 */
/** @hidden */
export const LectureSectionSchema = z.object({
    id: z.number(),
    name: z.string().optional(),
    is_published: z.boolean().optional(),
    position: z.number().optional(),
    lectures: z.array(z.object({
        id: z.number(),
        position: z.number().optional(),
        is_published: z.boolean().optional(),
    })).optional(),
});

/** Inferred TypeScript type for {@link LectureSectionSchema}. */
export interface LectureSection extends z.infer<typeof LectureSectionSchema> {}

/**
 * The author bio attached to a detailed course response.
 */
/** @hidden */
export const AuthorBioSchema = z.object({
    user_id: z.number().optional(),
    name: z.string().optional(),
    bio: z.string().nullable().optional(),
    profile_image_url: z.string().nullable().optional(),
});

/** Inferred TypeScript type for {@link AuthorBioSchema}. */
export interface AuthorBio extends z.infer<typeof AuthorBioSchema> {}

/**
 * A detailed course object as returned from the `/courses/:id` endpoint.
 * Extends the base {@link CourseSchema} with lecture sections and author bio.
 */
/** @hidden */
export const CourseDetailSchema = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    heading: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    is_published: z.boolean().nullable().optional(),
    image_url: z.string().nullable().optional(),
    lecture_sections: z.array(LectureSectionSchema).optional(),
    author_bio: AuthorBioSchema.optional(),
});

/** Inferred TypeScript type for {@link CourseDetailSchema}. */
export interface CourseDetail extends z.infer<typeof CourseDetailSchema> {}

/**
 * Wrapper for the `/courses/:id` endpoint response.
 */
/** @hidden */
export const CourseDetailResponseSchema = z.object({
    course: CourseDetailSchema,
});

/** Inferred TypeScript type for {@link CourseDetailResponseSchema}. */
export interface CourseDetailResponse extends z.infer<typeof CourseDetailResponseSchema> {}

/**
 * A single quiz question within a lecture attachment.
 */
/** @hidden */
export const QuizQuestionSchema = z.object({
    question: z.string().optional(),
    question_type: z.string().optional(),
    answers: z.array(z.string()).optional(),
    correct_answers: z.array(z.string()).optional(),
    graded: z.boolean().optional(),
});

/** Inferred TypeScript type for {@link QuizQuestionSchema}. */
export interface QuizQuestion extends z.infer<typeof QuizQuestionSchema> {}

/**
 * An attachment on a lecture, which may include video, text, PDF,
 * or quiz content depending on the `kind` field.
 */
/** @hidden */
export const LectureAttachmentSchema = z.object({
    id: z.number(),
    name: z.string().optional(),
    kind: z.string().optional(),
    url: z.string().nullable().optional(),
    text: z.string().nullable().optional(),
    position: z.number().optional(),
    file_size: z.number().nullable().optional(),
    file_extension: z.string().nullable().optional(),
    quiz: z.object({
        id: z.number(),
        questions: z.array(QuizQuestionSchema).optional(),
    }).nullable().optional(),
});

/** Inferred TypeScript type for {@link LectureAttachmentSchema}. */
export interface LectureAttachment extends z.infer<typeof LectureAttachmentSchema> {}

/**
 * A detailed lecture object as returned from the `/courses/:id/lectures/:id` endpoint.
 * Includes position, section reference, and all attachments.
 */
/** @hidden */
export const LectureDetailSchema = z.object({
    id: z.number(),
    name: z.string().optional(),
    is_published: z.boolean().optional(),
    position: z.number().optional(),
    lecture_section_id: z.number().optional(),
    attachments: z.array(LectureAttachmentSchema).optional(),
});

/** Inferred TypeScript type for {@link LectureDetailSchema}. */
export interface LectureDetail extends z.infer<typeof LectureDetailSchema> {}

/**
 * Wrapper for the `/courses/:id/lectures/:id` endpoint response.
 */
/** @hidden */
export const LectureDetailResponseSchema = z.object({
    lecture: LectureDetailSchema,
});

/** Inferred TypeScript type for {@link LectureDetailResponseSchema}. */
export interface LectureDetailResponse extends z.infer<typeof LectureDetailResponseSchema> {}

/**
 * A single enrolment record for a course, representing a user's
 * progress and completion status.
 */
/** @hidden */
export const EnrolmentSchema = z.object({
    user_id: z.number(),
    enrolled_at: z.string().nullable().optional(),
    expires_at: z.string().nullable().optional(),
    completed_at: z.string().nullable().optional(),
    percent_complete: z.number().optional(),
});

/** Inferred TypeScript type for {@link EnrolmentSchema}. */
export interface Enrolment extends z.infer<typeof EnrolmentSchema> {}

/**
 * The paginated wrapper returned by the `/courses/:id/enrollments` endpoint.
 */
/** @hidden */
export const EnrolmentsResponseSchema = z.object({
    enrollments: z.array(EnrolmentSchema),
    meta: PaginationMetaSchema.optional(),
});

/** Inferred TypeScript type for {@link EnrolmentsResponseSchema}. */
export interface EnrolmentsResponse extends z.infer<typeof EnrolmentsResponseSchema> {}

/**
 * The paginated wrapper object returned by Teachable course list endpoints.
 */
/** @hidden */
export const CoursesResponseSchema = z.object({
    courses: z.array(CourseSchema),
    meta: PaginationMetaSchema.optional(),
});

/** Inferred TypeScript type for {@link CoursesResponseSchema}. */
export interface CoursesResponse extends z.infer<typeof CoursesResponseSchema> {}