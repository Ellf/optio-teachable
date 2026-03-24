import { z } from 'zod';
import {
    WebhooksResponseSchema,
    WebhookEventsResponseSchema,
} from './schemas';

/**
 * @module WebhooksAPI
 * @description Provides methods for querying webhook resources from the Teachable v1 API.
 */

/**
 * Handles all webhook-related API operations.
 * Intended to be instantiated by a parent API client that provides the base fetch logic.
 *
 * @remarks
 * These endpoints are read-only. Creating, updating, or deleting webhooks
 * is not supported in this SDK.
 */
export class WebhooksAPI {

    /**
     * Creates a new WebhooksAPI instance.
     * @param baseFetch - A generic fetch function provided by the parent client.
     * Handles request execution and response validation against a Zod schema.
     * @example
     * const webhooks = new WebhooksAPI((endpoint, schema) => myClient.fetch(endpoint, schema));
     */
    constructor(private baseFetch: <T>(endpoint: string, schema: z.ZodSchema<T>) => Promise<T>) {}

    /**
     * Retrieves all webhooks registered on the Teachable school.
     * @returns A promise resolving to a validated `WebhooksResponse` object.
     * @example
     * const { webhooks } = await webhooksAPI.getList();
     */
    async getList() {
        return this.baseFetch(`/webhooks`, WebhooksResponseSchema);
    }

    /**
     * Retrieves a paginated list of delivery events for a specific webhook,
     * with optional filters for HTTP status range and creation date.
     * @param webhookId - The unique identifier of the webhook.
     * @param page - The page number to retrieve. Defaults to `1`.
     * @param per - The number of results per page. Defaults to `20`, maximum: `100`.
     * @param filters - Optional filters to narrow the results.
     * @param filters.responseHttpStatusGte - Return only events with an HTTP status >= this value.
     * @param filters.responseHttpStatusLte - Return only events with an HTTP status <= this value.
     * @param filters.createdBefore - Return only events created before this date (ISO 8601).
     * @param filters.createdAfter - Return only events created after this date (ISO 8601).
     * @returns A promise resolving to a validated `WebhookEventsResponse` object.
     * @throws {Error} If no webhook exists with the given ID or the request fails.
     * @example
     * // All events for a webhook
     * const { events } = await webhooksAPI.getEvents(42);
     *
     * // Only failed events (HTTP 4xx/5xx)
     * const { events } = await webhooksAPI.getEvents(42, 1, 20, {
     *     responseHttpStatusGte: 400,
     * });
     */
    async getEvents(webhookId: number, page = 1, per = 20, filters: {
        responseHttpStatusGte?: number;
        responseHttpStatusLte?: number;
        createdBefore?: string;
        createdAfter?: string;
    } = {}) {
        const params = new URLSearchParams({
            page: String(page),
            per: String(per),
        });

        if (filters.responseHttpStatusGte !== undefined) params.append('response_http_status_gte', String(filters.responseHttpStatusGte));
        if (filters.responseHttpStatusLte !== undefined) params.append('response_http_status_lte', String(filters.responseHttpStatusLte));
        if (filters.createdBefore) params.append('created_before', filters.createdBefore);
        if (filters.createdAfter)  params.append('created_after', filters.createdAfter);

        return this.baseFetch(`/webhooks/${webhookId}/events?${params.toString()}`, WebhookEventsResponseSchema);
    }
}