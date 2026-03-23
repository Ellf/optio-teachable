import { UsersAPI } from './users';
import { CoursesAPI } from './courses';
import { TransactionsAPI } from "./transactions";
import type { $ZodIssue } from '@zod/core';

/**
 * @module TeachableV1
 * @description Implements the Teachable v1 API, exposing resource-specific
 * sub-clients and a shared authenticated fetch layer.
 */

/**
 * The v1 Teachable API client. Manages authentication, base URL configuration,
 * and provides access to all v1 resource endpoints via typed sub-clients.
 *
 * Instantiated automatically by {@link TeachableClient} — you should not
 * need to create this directly.
 *
 * @example
 * // Typically accessed via the root client:
 * const client = new TeachableClient('your-api-key');
 * const users = await client.v1.users.getList();
 *
 * // Debug mode logs all outgoing requests and responses:
 * const v1 = new TeachableV1('your-api-key', true);
 */
export class TeachableV1 {

    /** Provides access to user-related API operations. */
    public users: UsersAPI;

    /** Provides access to course-related API operations. */
    public courses: CoursesAPI;

    /** Provides access to transaction-related API operations. */
    public transactions: TransactionsAPI;

    // public enrollments: EnrollmentsAPI;

    /** The base URL for all Teachable v1 API requests. */
    private baseUrl = 'https://developers.teachable.com/v1';

    /**
     * Creates a new TeachableV1 instance, validates the API key,
     * and initialises all resource sub-clients with the shared fetch layer.
     * @param apiKey - Your Teachable API key. Required — throws if empty or missing.
     * @param enableDebug - If `true`, logs all outgoing requests and responses to the console. Defaults to `false`.
     * @throws {Error} If `apiKey` is not provided.
     */
    constructor(private apiKey: string, private enableDebug = false) {
        if (!apiKey) throw new Error("Teachable API Key is required");

        // Bind the fetch method so "this" context isn't lost
        const fetcher = this.fetchTeachable.bind(this);

        // Instantiate the resources, passing in the fetcher
        this.users = new UsersAPI(fetcher);
        this.courses = new CoursesAPI(fetcher);
        this.transactions = new TransactionsAPI(fetcher);
    }

    /**
     * The internal authenticated fetch method shared across all resource sub-clients.
     * Sends a GET request to the given endpoint, validates the response status,
     * and parses the JSON response body against the provided Zod schema.
     *
     * @template T - The expected return type, inferred from the Zod schema.
     * @param endpoint - The API endpoint path (e.g. `/users?page=1`), appended to the base URL.
     * @param schema - A Zod schema used to parse and validate the raw API response.
     * @returns A promise resolving to the validated response of type `T`.
     * @throws {Error} If the response status is not OK, including the status code and response body.
     *
     */
    private async fetchTeachable<T>(endpoint: string, schema: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
                'apiKey': this.apiKey,
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Teachable V1 Error: ${response.status} ${await response.text()}`);
        }

        const rawData = await response.json();
        const result = schema.safeParse(rawData);

        if (!result.success) {
            throw new Error('Teachable API response did not match expected schema.\n' +
                result.error.issues.map((i:$ZodIssue) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
            );
        }

        return result.data;
    }

    /**
     * Sends a raw, unvalidated GET request to any v1 endpoint.
     * Useful for exploring undocumented endpoints or debugging API responses
     * without schema validation.
     *
     * Logs the request URL and full response body when debug mode is active
     * (either via `enableDebug` on the constructor, or the `logOutput` parameter).
     *
     * @param endpoint - The API endpoint path (e.g. `/enrollments`), appended to the base URL.
     * @param logOutput - If `true`, forces request/response logging for this call regardless of `enableDebug`. Defaults to `false`.
     * @returns A promise resolving to the raw, unparsed JSON response.
     * @throws {Error} If the response status is not OK, including the status code.
     * @example
     * // Explore an endpoint without a schema
     * const raw = await client.v1.getRaw('/enrollments', true);
     */
    async getRaw(endpoint: string, logOutput = false) {
        const url = `${this.baseUrl}${endpoint}`;

        if (this.enableDebug || logOutput) {
            console.log(`[Teachable Debug] 📡 GET ${url}`);
        }

        const response = await fetch(url, {
            headers: {
                'apiKey': this.apiKey,
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Teachable Debug] ❌ Error ${response.status}:`, errorText);
            throw new Error(`Raw Fetch Error: ${response.status}`);
        }

        const data = await response.json();

        if (this.enableDebug || logOutput) {
            console.log(`[Teachable Debug] ✅ Response:`, JSON.stringify(data, null, 2));
        }

        return data;
    }
}