import { z } from 'zod';
import {
    CoursesResponseSchema,
    CourseDetailResponseSchema,
    EnrolmentsResponseSchema,
    LectureDetailResponseSchema,
    CourseProgressResponseSchema,
    QuizIdsResponseSchema,
    LectureQuizResponseSchema, QuizResponsesResponseSchema, LectureVideoResponseSchema,
} from './schemas';

/**
 * @module CoursesAPI
 * @description Provides methods for querying course resources from the Teachable v1 API.
 */

/**
 * Handles all course-related API operations.
 * Intended to be instantiated by a parent API client that provides the base fetch logic.
 */
export class CoursesAPI {

    /**
     * Creates a new CoursesAPI instance.
     * @param baseFetch - A generic fetch function provided by the parent client.
     * Handles request execution and response validation against a Zod schema.
     * @example
     * const courses = new CoursesAPI((endpoint, schema) => myClient.fetch(endpoint, schema));
     */
    constructor(private baseFetch: <T>(endpoint: string, schema: z.ZodSchema<T>) => Promise<T>) {}

    /**
     * Retrieves a paginated list of courses with optional filters.
     * @param page - The page number to retrieve. Defaults to `1`.
     * @param per - The number of results per page. Defaults to `20`, maximum `100`.
     * @param filters - Optional filters to narrow the results.
     * @param filters.name - Restricts results to courses matching this name.
     * @param filters.isPublished - If `true`, returns only published courses.
     * @param filters.authorBioId - Restricts results to courses by this author.
     * @param filters.createdAt - Restricts results to courses created at this timestamp (ISO 8601).
     * @returns A promise resolving to a validated `CoursesResponse` object.
     * @example
     * // All courses, first page
     * const { courses, meta } = await coursesAPI.getList();
     * console.log(`Page 1 of ${meta?.number_of_pages} — ${meta?.total} courses total`);
     *
     * // Published courses by a specific author
     * const { courses } = await coursesAPI.getList(1, 100, {
     *     isPublished: true,
     *     authorBioId: 11111,
     * });
     */
    async getList(page = 1, per = 20, filters: {
        name?: string;
        isPublished?: boolean;
        authorBioId?: number;
        createdAt?: string;
    } = {}) {
        const params = new URLSearchParams({
            page: String(page),
            per: String(per),
        });

        if (filters.name)                       params.append('name', filters.name);
        if (filters.isPublished !== undefined)  params.append('is_published', String(filters.isPublished));
        if (filters.authorBioId)                params.append('author_bio_id', String(filters.authorBioId));
        if (filters.createdAt)                  params.append('created_at', filters.createdAt);

        return this.baseFetch(`/courses?${params.toString()}`, CoursesResponseSchema);
    }

    /**
     * Retrieves a single course by its unique numeric ID.
     * Includes full lecture section structure and author bio.
     * @param id - The unique identifier of the course.
     * @returns A promise resolving to a validated `CourseDetailResponse` object.
     * @throws {Error} If no course exists with the given ID or the request fails.
     * @example
     * const { course } = await coursesAPI.getById(42);
     */
    async getById(id: number) {
        return this.baseFetch(`/courses/${id}`, CourseDetailResponseSchema);
    }

    /**
     * Retrieves a paginated list of active enrolments for a specific course,
     * including student progress. Optionally filter by enrolment date range
     * and control sort direction.
     * @param courseId - The unique identifier of the course.
     * @param page - The page number to retrieve. Defaults to `1`.
     * @param per - The number of results per page. Defaults to `20`, maximum `100`.
     * @param filters - Optional filters to narrow the results.
     * @param filters.enrolledInAfter - Return only enrolments created after this date (ISO 8601).
     * @param filters.enrolledInBefore - Return only enrolments created before this date (ISO 8601).
     * @param filters.sortDirection - Sort enrolments by `enrolled_at`. Accepts `asc` or `desc`.
     * @returns A promise resolving to a validated `EnrolmentsResponse` object.
     * @throws {Error} If no course exists with the given ID or the request fails.
     * @example
     * // All enrolments for a course
     * const { enrollments, meta } = await coursesAPI.getEnrolments(42);
     * console.log(`${meta?.total} enrolled students`);
     *
     * // Recent enrolments, newest first
     * const { enrollments } = await coursesAPI.getEnrolments(42, 1, 100, {
     *     enrolledInAfter: '2026-01-01T00:00:00Z',
     *     sortDirection: 'desc',
     * });
     */
    async getEnrolments(courseId: number, page = 1, per = 20, filters: {
        enrolledInAfter?: string;
        enrolledInBefore?: string;
        sortDirection?: 'asc' | 'desc';
    } = {}) {
        const params = new URLSearchParams({
            page: String(page),
            per: String(per),
        });

        if (filters.enrolledInAfter)   params.append('enrolled_in_after', filters.enrolledInAfter);
        if (filters.enrolledInBefore)  params.append('enrolled_in_before', filters.enrolledInBefore);
        if (filters.sortDirection)     params.append('sort_direction', filters.sortDirection);

        return this.baseFetch(`/courses/${courseId}/enrollments?${params.toString()}`, EnrolmentsResponseSchema);
    }

    /**
     * Retrieves a single lecture within a course by its unique ID.
     * Includes all attachments and quiz content if present.
     * @param courseId - The unique identifier of the course.
     * @param lectureId - The unique identifier of the lecture.
     * @returns A promise resolving to a validated `LectureDetailResponse` object.
     * @throws {Error} If no course or lecture exists with the given IDs or the request fails.
     * @example
     * const { lecture } = await coursesAPI.getLecture(42, 7);
     */
    async getLecture(courseId: number, lectureId: number) {
        return this.baseFetch(`/courses/${courseId}/lectures/${lectureId}`, LectureDetailResponseSchema);
    }

    /**
     * Retrieves the progress record for a specific user on a specific course.
     * Both `courseId` and `userId` are required by the Teachable API.
     * @param courseId - The unique identifier of the course.
     * @param userId - The unique identifier of the user. Required.
     * @param page - The page number to retrieve. Defaults to `1`.
     * @param per - The number of results per page. Defaults to `20`, maximum `100`.
     * @returns A promise resolving to a validated `CourseProgressResponse` object.
     * @throws {Error} If either ID is invalid or the request fails.
     * @remarks
     * Unlike most list endpoints, `userId` is a required query parameter here —
     * omitting it will result in an API error. Progress is always scoped
     * to a single user and course combination.
     * @example
     * const { course_progress } = await coursesAPI.getProgress(2550579, 8167328);
     * console.log(`${course_progress.percent_complete}% complete`);
     *
     * if (course_progress.certificate.issued_at) {
     *     console.log(`Certificate issued: ${course_progress.certificate.issued_at}`);
     * }
     */
    async getProgress(courseId: number, userId: number, page = 1, per = 20) {
        const params = new URLSearchParams({
            user_id: String(userId),
            page: String(page),
            per: String(per),
        });
        return this.baseFetch(`/courses/${courseId}/progress?${params.toString()}`, CourseProgressResponseSchema);
    }

    /**
     * Retrieves the quiz IDs associated with a specific lecture.
     * Use the returned IDs with {@link getQuiz} or {@link getQuizResponses}.
     * @param courseId - The unique identifier of the course.
     * @param lectureId - The unique identifier of the lecture.
     * @returns A promise resolving to a validated `QuizIdsResponse` object.
     * @throws {Error} If no course or lecture exists with the given IDs or the request fails.
     * @example
     * const { quiz_ids } = await coursesAPI.getQuizIds(204306, 61498574);
     * console.log(`Found ${quiz_ids.length} quiz(zes) on this lecture`);
     *
     * // Fetch full details for each quiz
     * for (const quizId of quiz_ids) {
     *     const quiz = await coursesAPI.getQuiz(204306, 61498574, quizId);
     * }
     */
    async getQuizIds(courseId: number, lectureId: number) {
        return this.baseFetch(
            `/courses/${courseId}/lectures/${lectureId}/quizzes`,
            QuizIdsResponseSchema
        );
    }

    /**
     * Retrieves a specific quiz attachment by its ID, including all questions,
     * answers, and grading configuration.
     * @param courseId - The unique identifier of the course.
     * @param lectureId - The unique identifier of the lecture.
     * @param quizId - The unique identifier of the quiz. Retrieve via {@link getQuizIds}.
     * @returns A promise resolving to a validated `LectureQuizResponse` object.
     * @throws {Error} If any of the provided IDs are invalid or the request fails.
     * @example
     * const { quiz_ids } = await coursesAPI.getQuizIds(204306, 61498574);
     *
     * for (const quizId of quiz_ids) {
     *     const { quiz } = await coursesAPI.getQuiz(204306, 61498574, quizId);
     *     console.log(`Quiz ${quiz.id} has ${quiz.quiz.questions.length} questions`);
     * }
     */
    async getQuiz(courseId: number, lectureId: number, quizId: number) {
        return this.baseFetch(
            `/courses/${courseId}/lectures/${lectureId}/quizzes/${quizId}`,
            LectureQuizResponseSchema
        );
    }

    /**
     * Retrieves all student responses for a specific quiz.
     * @param courseId - The unique identifier of the course.
     * @param lectureId - The unique identifier of the lecture.
     * @param quizId - The unique identifier of the quiz. Retrieve via {@link getQuizIds}.
     * @returns A promise resolving to a validated `QuizResponsesResponse` object.
     * @throws {Error} If any of the provided IDs are invalid or the request fails.
     * @remarks
     * Student grades (`percent_correct`) are only recorded if the
     * 'Record grades for this quiz' toggle is enabled in the Teachable admin
     * dashboard under the quiz settings. If this setting is off, `percent_correct`
     * will be `null` for all responses even if students have completed the quiz.
     * @example
     * const { quiz_responses } = await coursesAPI.getQuizResponses(204306, 61498574, 122226740);
     * console.log(`${quiz_responses.responses.length} students responded`);
     *
     * quiz_responses.responses.forEach(r => {
     *     const pct = r.percent_correct != null
     *         ? `${(r.percent_correct * 100).toFixed(0)}%`
     *         : 'not graded';
     *     console.log(`${r.student_name}: ${pct}`);
     * });
     */
    async getQuizResponses(courseId: number, lectureId: number, quizId: number) {
        return this.baseFetch(
            `/courses/${courseId}/lectures/${lectureId}/quizzes/${quizId}/responses`,
            QuizResponsesResponseSchema
        );
    }

    /**
     * Retrieves the video asset and metadata for a specific lecture video.
     * Returns a time-limited HLS stream URL and thumbnail URL via Hotmart's CDN.
     * @param courseId - The unique identifier of the course.
     * @param lectureId - The unique identifier of the lecture.
     * @param videoId - The attachment ID of the video. Use {@link getLecture} to
     * find this value — it is the `id` of the attachment where `kind === 'video'`.
     * @param filters - Optional filters.
     * @param filters.userId - The ID of the user watching the video. May scope
     * the returned stream URL to a specific user session.
     * @returns A promise resolving to a validated `LectureVideoResponse` object.
     * @throws {Error} If any of the provided IDs are invalid or the request fails.
     * @remarks
     * The stream URL in `video.video_asset.url` is time-limited and will expire.
     * Always fetch a fresh response when you need a playable URL — never cache
     * the stream URL between requests.
     *
     * **`userId`** — observed to return the same response with or without this
     * parameter in testing. May have an effect on the signed URL scope in
     * production environments with DRM or per-user access controls.
     * @example
     * const { video } = await coursesAPI.getVideo(1886748, 42809204, 111817954);
     *
     * // Scoped to a specific user
     * const { video } = await coursesAPI.getVideo(1886748, 42809204, 111817954, {
     *     userId: 8167328,
     * });
     */
    async getVideo(courseId: number, lectureId: number, videoId: number, filters: {
        userId?: number;
    } = {}) {
        const params = new URLSearchParams();
        if (filters.userId) params.append('user_id', String(filters.userId));

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.baseFetch(
            `/courses/${courseId}/lectures/${lectureId}/videos/${videoId}${query}`,
            LectureVideoResponseSchema
        );
    }
}