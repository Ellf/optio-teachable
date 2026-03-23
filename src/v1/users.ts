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
     * @param per - The number of results per page. Defaults to `20`.
     * @returns A promise resolving to a validated `UserSearchResponse` object.
     * @example
     * const firstPage = await usersAPI.getList();
     * const secondPage = await usersAPI.getList(2, 50);
     */
    async getList(page = 1, per = 20) {
        const endpoint = `/users?page=${page}&per=${per}`;
        return this.baseFetch(endpoint, UserSearchResponseSchema);
    }

    /**
     * Retrieves a single user by their unique numeric ID.
     * @param id - The unique identifier of the user.
     * @returns A promise resolving to a validated `UserDetail` object.
     * @throws {Error} If no user exists with the given ID or the request fails.
     * @example
     * const user = await usersAPI.getById(42);
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
        const endpoint = `/users?email=${encodeURIComponent(email)}`;
        return this.baseFetch(endpoint, UserSearchResponseSchema);
    }
}