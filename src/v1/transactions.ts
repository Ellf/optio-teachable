import { z } from 'zod';
import { TransactionsResponseSchema, TransactionSchema } from './schemas';

/**
 * @module TransactionsAPI
 * @description Provides methods for querying transaction resources from the API.
 */

/**
 * Handles all transaction-related API operations.
 * Intended to be instantiated by a parent API client that provides the base fetch logic.
 */
export class TransactionsAPI {

    /**
     * Creates a new TransactionsAPI instance.
     * @param baseFetch - A generic fetch function provided by the parent client.
     * Handles request execution and response validation against a Zod schema.
     * @example
     * const transactions = new TransactionsAPI((endpoint, schema) => myClient.fetch(endpoint, schema));
     */
    constructor(private baseFetch: <T>(endpoint: string, schema: z.ZodSchema<T>) => Promise<T>) {}

    /**
     * Retrieves a paginated list of transactions with optional filters.
     * All filter parameters are optional and can be combined freely.
     * @param page - The page number to retrieve. Defaults to `1`.
     * @param per - The number of results per page. Defaults to `20`.
     * @param filters - Optional filters to apply to the query.
     * @param filters.userId - If provided, restricts results to transactions belonging to this user.
     * @param filters.affiliateId - If provided, restricts results to transactions for this affiliate.
     * @param filters.courseId - If provided, restricts results to transactions for this course.
     * @param filters.pricingPlanId - If provided, restricts results to transactions for this pricing plan.
     * @param filters.isFullyRefunded - If `true`, returns only fully refunded transactions.
     * @param filters.isChargeback - If `true`, returns only chargeback transactions.
     * @param filters.startDate - If provided, restricts results to transactions on or after this date (ISO 8601).
     * @param filters.endDate - If provided, restricts results to transactions on or before this date (ISO 8601).
     * @returns A promise resolving to a validated `TransactionsResponse` object.
     * @example
     * // All transactions, first page
     * const all = await transactionsAPI.getList();
     *
     * // Refunded transactions for a specific user and course
     * const filtered = await transactionsAPI.getList(1, 20, {
     *     userId: 99,
     *     courseId: 42,
     *     isFullyRefunded: true,
     * });
     */
    async getList(page = 1, per = 20, filters: {
        userId?: number;
        affiliateId?: number;
        courseId?: number;
        pricingPlanId?: number;
        isFullyRefunded?: boolean;
        isChargeback?: boolean;
        startDate?: string;
        endDate?: string;
    } = {}) {
        const params = new URLSearchParams({
            page: String(page),
            per: String(per),
        });

        if (filters.userId)          params.append('user_id', String(filters.userId));
        if (filters.affiliateId)     params.append('affiliate_id', String(filters.affiliateId));
        if (filters.courseId)        params.append('course_id', String(filters.courseId));
        if (filters.pricingPlanId)   params.append('pricing_plan_id', String(filters.pricingPlanId));
        if (filters.isFullyRefunded !== undefined) params.append('is_fully_refunded', String(filters.isFullyRefunded));
        if (filters.isChargeback !== undefined)    params.append('is_chargeback', String(filters.isChargeback));
        if (filters.startDate)       params.append('start_date', filters.startDate);
        if (filters.endDate)         params.append('end_date', filters.endDate);

        return this.baseFetch(`/transactions?${params.toString()}`, TransactionsResponseSchema);
    }

    /**
     * Retrieves a single transaction by its unique numeric ID.
     * @param id - The unique identifier of the transaction.
     * @returns A promise resolving to a validated `Transaction` object.
     * @throws {Error} If no transaction exists with the given ID or the request fails.
     * @example
     * const transaction = await transactionsAPI.getById(101);
     */
    async getById(id: number) {
        const endpoint = `/transactions/${id}`;
        return this.baseFetch(endpoint, TransactionSchema);
    }
}