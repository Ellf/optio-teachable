// src/index.ts
import { TeachableV1 } from './v1';

/**
 * @module TeachableClient
 * @description The main entry point for the Teachable API client.
 * Initializes and exposes versioned API interfaces.
 */

/**
 * The root client for interacting with the Teachable API.
 * Instantiating this class automatically sets up all versioned sub-clients.
 *
 * @example
 * import { TeachableClient } from './src';
 *
 * // Standard usage
 * const client = new TeachableClient('your-api-key');
 *
 * // Debug mode — logs all requests and responses to the console
 * const client = new TeachableClient('your-api-key', true);
 * const users = await client.v1.users.getList(); // will log the request
 */
export class TeachableClient {

    /**
     * Provides access to all Teachable v1 API resources,
     * including users, transactions, and courses.
     */
    public v1: TeachableV1;

    /**
     * Creates a new TeachableClient instance and initializes the v1 sub-client.
     * @param apiKey - Your Teachable API key, used to authenticate all requests.
     * @param enableDebug - If `true`, enables debug mode for all sub-clients. Defaults to `false`.
     */
    constructor(apiKey: string, enableDebug = false) {
        // Automatically initialize V1 when the main client is created
        this.v1 = new TeachableV1(apiKey, enableDebug);
    }
}

/**
 * Re-exports all Zod schemas and inferred TypeScript types from the v1 schema definitions,
 * so consuming applications can use them for validation and type safety without
 * importing directly from internal paths.
 */
export { TeachableV1 } from './v1';
export { UsersAPI } from './v1/users';
export { CoursesAPI } from './v1/courses';
export { TransactionsAPI } from './v1/transactions';
export { PricingPlansAPI } from './v1/pricing_plans';
export { WebhooksAPI } from './v1/webhooks';
export * from './v1/schemas';