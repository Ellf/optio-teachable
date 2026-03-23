import { z } from 'zod';
import {
    CoursesResponseSchema,
    CourseDetailResponseSchema,
    EnrolmentsResponseSchema,
    LectureDetailResponseSchema,
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
     * @param per - The number of results per page. Defaults to `20`.
     * @param filters - Optional filters to narrow the results.
     * @param filters.name - Restricts results to courses matching this name.
     * @param filters.isPublished - If `true`, returns only published courses.
     * @param filters.authorBioId - Restricts results to courses by this author.
     * @returns A promise resolving to a validated `CoursesResponse` object.
     * @example
     * // All courses, first page
     * const all = await coursesAPI.getList();
     *
     * // Published courses by a specific author
     * const filtered = await coursesAPI.getList(1, 20, {
     *     isPublished: true,
     *     authorBioId: 11111,
     * });
     */
    async getList(page = 1, per = 20, filters: {
        name?: string;
        isPublished?: boolean;
        authorBioId?: number;
    } = {}) {
        const params = new URLSearchParams({
            page: String(page),
            per: String(per),
        });

        if (filters.name)                        params.append('name', filters.name);
        if (filters.isPublished !== undefined)   params.append('is_published', String(filters.isPublished));
        if (filters.authorBioId)                 params.append('author_bio_id', String(filters.authorBioId));

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
     * Retrieves a paginated list of enrolments for a specific course.
     * @param courseId - The unique identifier of the course.
     * @param page - The page number to retrieve. Defaults to `1`.
     * @param per - The number of results per page. Defaults to `20`.
     * @returns A promise resolving to a validated `EnrolmentsResponse` object.
     * @throws {Error} If no course exists with the given ID or the request fails.
     * @example
     * const { enrollments } = await coursesAPI.getEnrolments(42);
     */
    async getEnrolments(courseId: number, page = 1, per = 20) {
        const params = new URLSearchParams({ page: String(page), per: String(per) });
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
}