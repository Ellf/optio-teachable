import { z } from 'zod';

/**
 * @module schemas
 * @description Zod schemas for validating and inferring types from the Teachable v1 API.
 * All schemas are exported, so consuming applications can use them directly
 * for runtime validation and static type inference via `z.infer<typeof Schema>`.
 */

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

/** @hidden */
export const PaginationMetaSchema = z.object({
    total: z.number().optional(),
    page: z.number().optional(),
    from: z.number().optional(),
    to: z.number().optional(),
    per_page: z.number().optional(),
    number_of_pages: z.number().optional(),
});

/**
 * Standard pagination metadata returned by Teachable list endpoints.
 */
export interface PaginationMeta extends z.infer<typeof PaginationMetaSchema> {}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

/** @hidden */
export const BasicUserSchema = z.object({
    id: z.number(),
    email: z.email(),
    name: z.string().nullable().optional(),
});

/**
 * A basic user object as returned in search result lists.
 * Name may be null as Teachable does not always populate this field.
 *
 * @example
 * const user: BasicUser = {
 *     id: 123456,
 *     email: 'jane@example.com',
 *     name: 'Jane Smith',
 * };
 *
 */
export interface BasicUser extends z.infer<typeof BasicUserSchema> {}

/** @hidden */
export const UserSearchResponseSchema = z.object({
    users: z.array(BasicUserSchema),
    meta: PaginationMetaSchema.optional(),
});

/**
 * The paginated wrapper object returned by Teachable user search endpoints.
 * Contains an array of basic users and optional pagination metadata.
 */
export interface UserSearchResponse extends z.infer<typeof UserSearchResponseSchema> {}

/** @hidden */
export const UserDetailSchema = z.object({
    id: z.number(),
    email: z.string(),
    name: z.string().nullable().optional(),
    src: z.string().nullable().optional(),
    role: z.string().optional(),
    last_sign_in_at: z.string().nullable().optional(),
    last_sign_in_ip: z.string().nullable().optional(),
    sign_in_count: z.number().optional(),
    tags: z.array(z.object({
        name: z.string(),
    })).optional(),
    courses: z.array(z.object({
        course_id: z.number().optional(),
        course_name: z.string().optional(),
        enrolled_at: z.string().nullable().optional(),
        percent_complete: z.number().optional(),
        completed_at: z.string().nullable().optional(),
        is_active_enrollment: z.boolean().optional(),
    })).optional(),
});

/**
 * A detailed user object as returned from the `/users/:id` endpoint.
 * Includes role, sign-in metadata, IP address, tags, and an optional
 * list of course enrolments.
 *
 * @remarks
 * **`src`** — the signup source of the user, visible in the Information tab
 * of the user profile in the Teachable dashboard. Can be used as a custom
 * identifier to associate a Teachable user with records in external systems
 * (e.g. a CRM ID, unique tag, or external user ID). Frequently `null` if
 * not set at signup.
 *
 * **`tags`** — an array of tag objects assigned to the user. Each tag has a
 * single `name` field. May be an empty array if no tags are assigned.
 * Tags can be managed through the Teachable dashboard or assigned at
 * signup via the `src` field.
 *
 * **`last_sign_in_ip`** — only populated for users who have signed in
 * at least once.
 *
 * **Course array** — uses `course_name` (not `name`) based on observed
 * live API responses, which differs from the official documentation.
 */
export interface UserDetail extends z.infer<typeof UserDetailSchema> {}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

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
export interface Transaction extends z.infer<typeof TransactionSchema> {}

/** @hidden */
export const TransactionsResponseSchema = z.object({
    transactions: z.array(TransactionSchema),
    meta: PaginationMetaSchema.optional(),
});

/**
 * The paginated wrapper object returned by Teachable transaction endpoints.
 * Includes full pagination metadata.
 *
 * @remarks
 * The Teachable v1 API does not provide a single transaction endpoint.
 * Transactions can only be retrieved via the list endpoint using filters
 * such as `userId`, `courseId`, or date range.
 *
 * **Processing delay** — new transactions can take up to two minutes to
 * appear via the API from the time of sale. Do not rely on this endpoint
 * for real-time payment confirmation.
 */
export interface TransactionsResponse extends z.infer<typeof TransactionsResponseSchema> {}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

/** @hidden */
export const CourseSchema = z.looseObject({
    id: z.number(),
    name: z.string().nullable().optional(),
    heading: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    is_published: z.boolean().nullable().optional(),
    image_url: z.string().nullable().optional(),
});

/**
 * A summary course object as returned in paginated list responses.
 * Uses `z.looseObject` to allow undocumented fields from the Teachable
 * API to pass through without causing validation failures.
 */
export interface Course extends z.infer<typeof CourseSchema> {}

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

/**
 * A single lecture section within a course, containing an ordered
 * list of lectures.
 */
export interface LectureSection extends z.infer<typeof LectureSectionSchema> {}

/** @hidden */
export const AuthorBioSchema = z.object({
    user_id: z.number().nullable().optional(),
    name: z.string().optional(),
    bio: z.string().nullable().optional(),
    profile_image_url: z.string().nullable().optional(),
});

/**
 * The author bio attached to a detailed course response.
 *
 * @remarks
 * **`bio`** — may contain HTML markup as entered in the Teachable dashboard.
 * Sanitise before rendering directly in a browser context.
 *
 * **`user_id`** — observed as `null` in live API responses despite being
 * documented as an integer. Always treat this field as nullable.
 */
export interface AuthorBio extends z.infer<typeof AuthorBioSchema> {}

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

/**
 * A detailed course object as returned from the `/courses/:id` endpoint.
 * Extends the base {@link CourseSchema} with lecture sections and author bio.
 */
export interface CourseDetail extends z.infer<typeof CourseDetailSchema> {}

/** @hidden */
export const CourseDetailResponseSchema = z.object({
    course: CourseDetailSchema,
});

/**
 * Wrapper for the `/courses/:id` endpoint response.
 */
export interface CourseDetailResponse extends z.infer<typeof CourseDetailResponseSchema> {}

/** @hidden */
export const QuizQuestionSchema = z.object({
    question: z.string(),
    question_type: z.enum(['single', 'multiple']),
    answers: z.array(z.string()),
    correct_answers: z.array(z.string()),
    graded: z.boolean(),
});

/**
 * A single quiz question within a lecture attachment.
 *
 * @remarks
 * **`question_type`** — `single` indicates only one correct answer exists.
 * `multiple` indicates more than one correct answer is possible.
 *
 * **`graded`** — if `true` the quiz contributes to course completion
 * requirements. If `false` it is purely informational.
 */
export interface QuizQuestion extends z.infer<typeof QuizQuestionSchema> {}

/** @hidden */
export const LectureAttachmentSchema = z.object({
    id: z.number(),
    name: z.string().nullable(),
    kind: z.enum([
        'text',
        'native_comments',
        'video',
        'audio',
        'image',
        'pdf',
        'quiz',
        'code_display',
        'code_embed',
        'upsell',
    ]),
    url: z.string().nullable().optional(),
    text: z.string().nullable().optional(),
    position: z.number().nullable(),
    file_size: z.number().nullable().optional(),
    file_extension: z.string().nullable().optional(),
    quiz: z.object({
        id: z.number(),
        questions: z.array(QuizQuestionSchema),
    }).nullable().optional(),
});

/**
 * An attachment on a lecture. The shape varies depending on the `kind` field.
 *
 * @remarks
 * **`kind` values and their behaviour:**
 *
 * | Kind | `name` | `url` | `text` | `file_size` | `quiz` |
 * |---|---|---|---|---|---|
 * | `text` | `null` | `null` | HTML string | `null` | `null` |
 * | `code_display` | `null` | `null` | HTML string | `null` | `null` |
 * | `code_embed` | `null` | `null` | HTML string | `null` | `null` |
 * | `native_comments` | `null` | `null` | `null` | `null` | `null` |
 * | `upsell` | `null` | `null` | `null` | `null` | `null` |
 * | `video` | filename | CDN URL | `null` | bytes | `null` |
 * | `audio` | filename | CDN URL | `null` | bytes | `null` |
 * | `image` | filename | CDN URL | `null` | bytes | `null` |
 * | `pdf` | filename | CDN URL | `null` | bytes | `null` |
 * | `quiz` | `null` | `null` | `null` | `null` | quiz object |
 *
 * **`text`** — contains raw HTML for `text`, `code_display`, and `code_embed` kinds.
 * Sanitise before rendering directly in a browser context.
 *
 * **`position`** — documented as required but may be `null` in some responses.
 *
 * **`url` for video kind**  — points to the original upload URL, not a
 * streamable URL. Use {@link CoursesAPI.getVideo} with the attachment `id`
 * to retrieve a playable HLS stream URL.
 *
 * **`file_size`** — documented as file size in bytes for video, audio, image,
 * and PDF attachments, but observed returning `0` for video files in live
 * API responses. Do not rely on this value for video attachments.
 */
export interface LectureAttachment extends z.infer<typeof LectureAttachmentSchema> {}

/** @hidden */
export const LectureDetailSchema = z.object({
    id: z.number(),
    name: z.string().optional(),
    is_published: z.boolean().optional(),
    position: z.number().optional(),
    lecture_section_id: z.number().optional(),
    attachments: z.array(LectureAttachmentSchema).optional(),
});

/**
 * A detailed lecture object as returned from the `/courses/:id/lectures/:id` endpoint.
 * Includes position, section reference, and all attachments.
 */
export interface LectureDetail extends z.infer<typeof LectureDetailSchema> {}

/** @hidden */
export const LectureDetailResponseSchema = z.object({
    lecture: LectureDetailSchema,
});

/** @hidden */
export const CourseCertificateSchema = z.object({
    page_id: z.number().nullable(),
    issued_at: z.string().nullable(),
    serial_number: z.string().nullable(),
});

/**
 * Certificate information for a course enrolment.
 * All fields are `null` until a certificate has been issued.
 */
export interface CourseCertificate extends z.infer<typeof CourseCertificateSchema> {}


/** @hidden */
export const CourseProgressLectureSchema = z.object({
    id: z.number(),
    name: z.string().optional(),
    is_completed: z.boolean().optional(),
    completed_at: z.string().nullable().optional(),
});

/**
 * A lecture progress record within a course progress response.
 * Note this is a different shape from {@link LectureDetail} — it contains
 * completion state rather than content or attachment data.
 */
export interface CourseProgressLecture extends z.infer<typeof CourseProgressLectureSchema> {}

/** @hidden */
export const CourseProgressSectionSchema = z.object({
    id: z.number(),
    name: z.string().optional(),
    lectures: z.array(CourseProgressLectureSchema).optional(),
});

/**
 * A lecture section progress record within a course progress response.
 * Note this is a different shape from {@link LectureSection} — it contains
 * only `id`, `name`, and lecture completion data. There is no `position`
 * or `is_published` field on this object.
 */
export interface CourseProgressSection extends z.infer<typeof CourseProgressSectionSchema> {}

/** @hidden */
export const CourseProgressSchema = z.object({
    id: z.number(),
    certificate: CourseCertificateSchema,
    completed_at: z.string().nullable(),
    enrolled_at: z.string().nullable(),
    percent_complete: z.number(),
    lecture_sections: z.array(CourseProgressSectionSchema),
});



/** @hidden */
export const CourseProgressResponseSchema = z.object({
    course_progress: CourseProgressSchema,
    meta: PaginationMetaSchema.optional(),
});

/**
 * Wrapper for the `/courses/:id/progress` endpoint response.
 *
 * @remarks
 * The `meta.total` field has been observed returning `0` in live API
 * responses despite a result being present. Do not rely on `meta.total`
 * from this endpoint to determine whether progress data exists.
 */
export interface CourseProgressResponse extends z.infer<typeof CourseProgressResponseSchema> {}

/**
 * Progress record for a specific user on a specific course.
 *
 * @remarks
 * **`certificate`** — all certificate fields are `null` until the student
 * meets the course completion requirements and a certificate is issued.
 * Once issued, `page_id` references the certificate page, `issued_at` is
 * the ISO 8601 timestamp of issue, and `serial_number` is a unique
 * certificate identifier prefixed with `cert_`.
 *
 * **`lecture_sections`** — returns an empty array `[]` until the student
 * has interacted with the course. Once progress exists, each section
 * lists its lectures with individual completion state and timestamps.
 *
 * **`percent_complete`** — a value between `0` and `100`.
 *
 * **`meta.total`** — returns the total number of lectures in the course
 * when progress data exists, not the number of progress records.
 * Returns `0` when the student has not yet started the course.
 */
export interface CourseProgress extends z.infer<typeof CourseProgressSchema> {}

/**
 * Wrapper for the `/courses/:id/lectures/:id` endpoint response.
export interface LectureDetailResponse extends z.infer<typeof LectureDetailResponseSchema> {}

/** @hidden */
export const EnrolmentSchema = z.object({
    user_id: z.number(),
    enrolled_at: z.string().nullable().optional(),
    expires_at: z.string().nullable().optional(),
    completed_at: z.string().nullable().optional(),
    percent_complete: z.number().optional(),
});

/**
 * A single enrollment record for a course, representing a user's
 * progress and completion status.
 */
export interface Enrolment extends z.infer<typeof EnrolmentSchema> {}

/** @hidden */
export const EnrolmentsResponseSchema = z.object({
    enrollments: z.array(EnrolmentSchema),
    meta: PaginationMetaSchema.optional(),
});

/**
 * The paginated wrapper returned by the `/courses/:id/enrollments` endpoint.
 *
 * @remarks
 * The `meta.per_page` field has been observed returning `0` in live API
 * responses despite results being present. This appears to be a Teachable
 * API bug — do not rely on `per_page` from this endpoint to determine
 * page size.
 */
export interface EnrolmentsResponse extends z.infer<typeof EnrolmentsResponseSchema> {}

/** @hidden */
export const CoursesResponseSchema = z.object({
    courses: z.array(CourseSchema),
    meta: PaginationMetaSchema.optional(),
});

/**
 * The paginated wrapper object returned by Teachable course list endpoints.
 */
export interface CoursesResponse extends z.infer<typeof CoursesResponseSchema> {}

/** @hidden */
export const QuizIdsResponseSchema = z.object({
    quiz_ids: z.array(z.number()),
});

/**
 * The response from the `/courses/:id/lectures/:id/quizzes` endpoint.
 * Returns an array of quiz IDs associated with the lecture.
 * Use these IDs with {@link CoursesAPI.getQuiz} to fetch full quiz details
 * or with {@link CoursesAPI.getQuizResponses} to fetch student responses.
 *
 * @remarks
 * A lecture may have zero or more quizzes. An empty `quiz_ids` array
 * indicates the lecture has no quizzes attached.
 */
export interface QuizIdsResponse extends z.infer<typeof QuizIdsResponseSchema> {}

/** @hidden */
export const QuizDetailSchema = z.object({
    id: z.number(),
    type: z.literal('Quiz'),
    questions: z.array(QuizQuestionSchema),
});

/**
 * The inner quiz object containing questions and type information.
 * Note this is nested inside {@link LectureQuiz} under the `quiz` property.
 */
export interface QuizDetail extends z.infer<typeof QuizDetailSchema> {}

/** @hidden */
export const LectureQuizSchema = z.object({
    id: z.number(),
    name: z.string().nullable(),
    kind: z.literal('quiz'),
    url: z.string().nullable(),
    text: z.string().nullable(),
    position: z.number(),
    quiz: QuizDetailSchema,
});

/**
 * A quiz attachment as returned from the `/courses/:id/lectures/:id/quizzes/:id` endpoint.
 *
 * @remarks
 * This object shares the same top-level shape as {@link LectureAttachment} with
 * `kind` fixed to `'quiz'`. The `quiz` property contains the actual quiz data
 * including all questions, answers, and grading configuration.
 *
 * **Naming note** — the outer object and the nested `quiz` field share the name
 * `quiz`. The outer object is the attachment wrapper; the inner `quiz.id` is the
 * quiz's own unique ID, distinct from the attachment `id`.
 *
 * **`name`** — documented as required but observed as `null` in live API responses.
 */
export interface LectureQuiz extends z.infer<typeof LectureQuizSchema> {}

/** @hidden */
export const LectureQuizResponseSchema = z.object({
    quiz: LectureQuizSchema,
});

/**
 * Wrapper for the `/courses/:id/lectures/:id/quizzes/:id` endpoint response.
 */
export interface LectureQuizResponse extends z.infer<typeof LectureQuizResponseSchema> {}

/** @hidden */
export const QuizResponseStudentSchema = z.object({
    student_id: z.number(),
    student_name: z.string().nullable().optional(),
    student_email: z.string().nullable().optional(),
    submitted_at: z.string().nullable().optional(),
    percent_correct: z.number().nullable().optional(),
});

/**
 * A single student's quiz response record.
 *
 * @remarks
 * **`percent_correct`** — a value between `0` and `1`, not `0`–`100`.
 * Multiply by `100` to get a percentage. For example, `1` means 100% correct,
 * `0.5` means 50% correct.
 *
 * **`percent_correct` may be `null`** — grades are only recorded if the
 * 'Record grades for this quiz' toggle is enabled in the quiz settings in
 * the Teachable admin dashboard. If this setting is off, `percent_correct`
 * will not be populated even for completed responses.
 *
 * **PII** — this object contains personally identifiable information
 * (`student_name`, `student_email`). Handle in accordance with your
 * privacy policy and applicable data protection regulations.
 */
export interface QuizResponseStudent extends z.infer<typeof QuizResponseStudentSchema> {}

/** @hidden */
export const QuizResponsesSchema = z.object({
    course_id: z.number(),
    course_name: z.string().optional(),
    lecture_id: z.number(),
    lecture_name: z.string().optional(),
    graded: z.boolean(),
    responses: z.array(QuizResponseStudentSchema),
});

/**
 * The quiz responses object containing course context and all student responses.
 *
 * @remarks
 * **`graded`** — reflects the quiz-level grading setting. If `false`, student
 * `percent_correct` values will not be populated regardless of whether
 * students have completed the quiz.
 */
export interface QuizResponses extends z.infer<typeof QuizResponsesSchema> {}

/** @hidden */
export const QuizResponsesResponseSchema = z.object({
    quiz_responses: QuizResponsesSchema,
});

/**
 * Wrapper for the `/courses/:id/lectures/:id/quizzes/:id/responses` endpoint.
 *
 * @remarks
 * This endpoint does not return pagination metadata — all responses are
 * returned in a single request.
 */
export interface QuizResponsesResponse extends z.infer<typeof QuizResponsesResponseSchema> {}

/** @hidden */
export const VideoAssetSchema = z.object({
    url: z.string().nullable().optional(),
    content_type: z.string().nullable().optional(),
});

/**
 * The streamable video asset attached to a lecture video.
 *
 * @remarks
 * **`url`** — an HLS stream URL (`.m3u8`) served via Hotmart's CDN.
 * This URL contains a time-limited signed token and will expire —
 * never cache this URL. Always fetch a fresh URL when needed.
 *
 * **`content_type`** — typically `'application/x-mpegURL'` for HLS streams.
 * Use this to configure your video player correctly.
 */
export interface VideoAsset extends z.infer<typeof VideoAssetSchema> {}

/** @hidden */
export const LectureVideoSchema = z.object({
    id: z.number(),
    status: z.string().optional(),
    url_thumbnail: z.string().nullable().optional(),
    media_type: z.string().optional(),
    media_duration: z.number().nullable().optional(),
    video_asset: VideoAssetSchema.optional(),
});

/**
 * ...
 * **Finding the `video_id`** — use {@link CoursesAPI.getLecture} to fetch the
 * lecture and find the attachment where `kind === 'video'`. The `attachment.id`
 * is the `video_id` to pass to {@link CoursesAPI.getVideo}.
 *
 * @example
 * // Find the video_id from a lecture's attachments
 * const { lecture } = await coursesAPI.getLecture(1886748, 42809204);
 * const videoAttachment = lecture.attachments?.find(a => a.kind === 'video');
 * if (videoAttachment) {
 *     const { video } = await coursesAPI.getVideo(1886748, 42809204, videoAttachment.id);
 *     console.log(`Stream: ${video.video_asset?.url}`);
 * }
 */
export interface LectureVideo extends z.infer<typeof LectureVideoSchema> {}

/** @hidden */
export const LectureVideoResponseSchema = z.object({
    video: LectureVideoSchema,
});

/**
 * Wrapper for the `/courses/:id/lectures/:id/videos/:id` endpoint response.
 *
 * @remarks
 * The stream URL returned in `video.video_asset.url` is time-limited and
 * signed. Always fetch a fresh response when you need a playable URL —
 * do not store or reuse previously fetched stream URLs.
 */
export interface LectureVideoResponse extends z.infer<typeof LectureVideoResponseSchema> {}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

/** @hidden */
export const WebhookSchema = z.object({
    id: z.number(),
    workflow_state: z.string().optional(),
    url: z.string().optional(),
    event_trigger: z.string().optional(),
    webhook_events_count: z.number().optional(),
});

/**
 * A single webhook registered on the Teachable school.
 *
 * @remarks
 * **Important behavioural notes observed from the live API:**
 *
 * - **Deleted webhooks are not filtered out** — the `/webhooks` endpoint returns all
 *   webhooks regardless of their state, including ones that have been deleted. There is
 *   no way to distinguish a deleted webhook from an inactive one via this API.
 *
 * - **`workflow_state` values** — observed values are `failed`, `pending`, and `verified`.
 *   Note that `verified` does not necessarily mean the webhook is active or published —
 *   it only indicates the endpoint URL was successfully verified at some point.
 *
 * - **`webhook_events_count`** — represents the total number of times this webhook
 *   has been triggered, across its entire lifetime.
 *
 * - **Read-only** — there are no POST or PATCH endpoints for webhooks in the Teachable
 *   v1 API. Webhooks can only be managed through the Teachable dashboard.
 */
export interface Webhook extends z.infer<typeof WebhookSchema> {}

/** @hidden */
export const WebhooksResponseSchema = z.object({
    webhooks: z.array(WebhookSchema),
});

/**
 * The wrapper returned by the `/webhooks` endpoint.
 *
 * @remarks
 * This endpoint returns all webhooks including deleted ones, with no
 * pagination or filtering support. See {@link Webhook} for important
 * notes on interpreting `workflow_state` values.
 */
export interface WebhooksResponse extends z.infer<typeof WebhooksResponseSchema> {}

/** @hidden */
export const WebhookEventSchema = z.object({
    id: z.number(),
    workflow_state: z.string().optional(),
    webhook_id: z.number(),
    attempt_count: z.number().optional(),
    last_attempted_at: z.string().nullable().optional(),
    created_at: z.string(),
    object_type: z.string().optional(),
    object_id: z.number().optional(),
    response_http_status: z.number().nullable().optional(),
});

/**
 * A single webhook event, representing one delivery attempt
 * from a webhook to its configured URL.
 *
 * The `workflow_state` reflects the delivery status.
 * The `response_http_status` is the HTTP status code returned by the receiving server.
 */
export interface WebhookEvent extends z.infer<typeof WebhookEventSchema> {}

/** @hidden */
export const WebhookEventsResponseSchema = z.object({
    events: z.array(WebhookEventSchema),
    meta: PaginationMetaSchema.optional(),
});

/**
 * The paginated wrapper returned by the `/webhooks/:id/events` endpoint.
 * Supports filtering by HTTP status range and creation date.
 */
export interface WebhookEventsResponse extends z.infer<typeof WebhookEventsResponseSchema> {}

// ---------------------------------------------------------------------------
// Pricing Plans
// ---------------------------------------------------------------------------

/** @hidden */
export const PricingPlanFrequencySchema = z.object({
    type: z.string().optional(),
    billing_interval: z.string().nullable().optional(),
    billing_interval_count: z.number().nullable().optional(),
    access_limit_date: z.string().nullable().optional(),
    access_limit_interval: z.string().nullable().optional(),
    access_limit_duration: z.number().nullable().optional(),
});

/**
 * The billing frequency configuration for a pricing plan.
 * Covers one-time, subscription, and access-limited payment types.
 */
export interface PricingPlanFrequency extends z.infer<typeof PricingPlanFrequencySchema> {}

/** @hidden */
export const PricingPlanSchema = z.object({
    id: z.number(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    name: z.string().optional(),
    price: z.number(),
    currency: z.string(),
    course_id: z.number().optional(),
});

/**
 * A summary pricing plan object as returned in paginated list responses.
 * Does not include frequency or trial configuration — use {@link PricingPlanDetail}
 * for the full object returned by `/pricing_plans/:id`.
 *
 * The `price` field is returned as an integer representing the smallest
 * currency unit (e.g. cents), so `4999` represents $49.99.
 */
export interface PricingPlan extends z.infer<typeof PricingPlanSchema> {}

/** @hidden */
export const PricingPlanDetailSchema = z.object({
    id: z.number(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    name: z.string().optional(),
    price: z.number(),
    currency: z.string(),
    course_id: z.number().optional(),
    description: z.string().nullable().optional(),
    free_trial_length: z.number().nullable().optional(),
    enrollment_cap: z.number().nullable().optional(),
    frequency: PricingPlanFrequencySchema.optional(),
});

/**
 * A detailed pricing plan object as returned from the `/pricing_plans/:id` endpoint.
 * Extends the base {@link PricingPlan} with frequency configuration,
 * free trial length, and enrolment cap.
 */
export interface PricingPlanDetail extends z.infer<typeof PricingPlanDetailSchema> {}

/** @hidden */
export const PricingPlanDetailResponseSchema = z.object({
    pricing_plan: PricingPlanDetailSchema,
});

/**
 * Wrapper for the `/pricing_plans/:id` endpoint response.
 */
export interface PricingPlanDetailResponse extends z.infer<typeof PricingPlanDetailResponseSchema> {}

/** @hidden */
export const PricingPlansResponseSchema = z.object({
    pricing_plans: z.array(PricingPlanSchema),
    meta: PaginationMetaSchema.optional(),
});

/**
 * The paginated wrapper returned by the `/pricing_plans` endpoint.
 */
export interface PricingPlansResponse extends z.infer<typeof PricingPlansResponseSchema> {}