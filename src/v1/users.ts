import { z } from 'zod';
import { UserSearchResponseSchema, UserDetailSchema } from './schemas';

/**
 * @module UsersAPI
 * @description Provides methods for querying user resources from the API.
 */

/**
 * Handles all user-related API operations.
 * Intended to be instantiated by a parent API client that provides the base fetch logic.
 */
export class UsersAPI {
    /**
     * Creates a new UsersAPI instance.
     * @param baseFetch - A generic fetch function provided by the parent client.
     * Handles request execution and response validation against a Zod schema.
     * @example
     * const users = new UsersAPI((endpoint, schema) => myClient.fetch(endpoint, schema));
     */
    constructor(private baseFetch: <T>(endpoint: string, schema: z.ZodSchema<T>) => Promise<T>) {}

    /**
     * Retrieves a paginated list of users.
     * @param page - The page number to retrieve. Defaults to `1`.
     * @param per - The number of results per page. Defaults to `20`, maximum: `100`.
     * @param filters - Optional filters to narrow the results.
     * @param filters.email - If provided, filters results to users matching this email address.
     * @param filters.searchAfter - Used to paginate beyond the 10,000 record limit.
     * Pass the ID of the last user returned in the previous page to fetch the next set of results.
     * @returns A promise resolving to a validated `UserSearchResponse` object.
     * @example
     * // Standard pagination
     * const { users } = await usersAPI.getList(1, 20);
     *
     * // Paginating beyond 10,000 records
     * const page1 = await usersAPI.getList(1, 100);
     * const lastId = page1.users[page1.users.length - 1]?.id;
     * const page2 = await usersAPI.getList(1, 100, { searchAfter: lastId });
     */
    async getList(page = 1, per = 20, filters: {
        email?: string;
        searchAfter?: number;
    } = {}) {
        const params = new URLSearchParams({
            page: String(page),
            per: String(per),
        });
        if (filters.email) params.append('email', filters.email);
        if (filters.searchAfter) params.append('search_after', String(filters.searchAfter));

        return this.baseFetch(`/users?${params.toString()}`, UserSearchResponseSchema);
    }

    /**
     * Retrieves a single user by their unique numeric ID.
     * @param id - The unique identifier of the user.
     * @returns A promise resolving to a validated `UserDetail` object.
     * @throws {Error} If no user exists with the given ID or the request fails.
     * @example
     * const user = await usersAPI.getById(123456);
     */
    async getById(id: number) {
        const endpoint = `/users/${id}`;
        return this.baseFetch(endpoint, UserDetailSchema);
    }

    /**
     * Searches for users matching a given email address.
     * The email is URL-encoded before being sent to the API.
     * @param email - The email address to search for.
     * @returns A promise resolving to a validated `UserSearchResponse` object.
     * @example
     * const results = await usersAPI.getByEmail('jane@example.com');
     */
    async getByEmail(email: string) {
        const params = new URLSearchParams({ email });
        return this.baseFetch(`/users?${params.toString()}`, UserSearchResponseSchema);
    }
}