import { z } from 'zod';
import {
    PricingPlansResponseSchema,
    PricingPlanDetailResponseSchema,
} from './schemas';

/**
 * @module PricingPlansAPI
 * @description Provides methods for querying pricing plan resources from the Teachable v1 API.
 */

/**
 * Handles all pricing plan-related API operations.
 * Intended to be instantiated by a parent API client that provides the base fetch logic.
 *
 * @remarks
 * These endpoints are read-only. Creating or modifying pricing plans
 * is not supported in this SDK.
 */
export class PricingPlansAPI {

    /**
     * Creates a new PricingPlansAPI instance.
     * @param baseFetch - A generic fetch function provided by the parent client.
     * Handles request execution and response validation against a Zod schema.
     * @example
     * const pricingPlans = new PricingPlansAPI((endpoint, schema) => myClient.fetch(endpoint, schema));
     */
    constructor(private baseFetch: <T>(endpoint: string, schema: z.ZodSchema<T>) => Promise<T>) {}

    /**
     * Retrieves a paginated list of all pricing plans across the school.
     * @param page - The page number to retrieve. Defaults to `1`.
     * @param per - The number of results per page. Defaults to `20`, maximum: `100`.
     * @returns A promise resolving to a validated `PricingPlansResponse` object.
     * @example
     * const { pricing_plans } = await pricingPlansAPI.getList();
     */
    async getList(page = 1, per = 20) {
        const params = new URLSearchParams({
            page: String(page),
            per: String(per),
        });
        return this.baseFetch(`/pricing_plans?${params.toString()}`, PricingPlansResponseSchema);
    }

    /**
     * Retrieves a single pricing plan by its unique numeric ID.
     * Includes full frequency configuration, free trial length, and enrolment cap.
     * @param id - The unique identifier of the pricing plan.
     * @returns A promise resolving to a validated `PricingPlanDetailResponse` object.
     * @throws {Error} If no pricing plan exists with the given ID or the request fails.
     * @example
     * const { pricing_plan } = await pricingPlansAPI.getById(4444);
     * console.log(`${pricing_plan.name} — ${pricing_plan.currency} ${pricing_plan.price}`);
     */
    async getById(id: number) {
        return this.baseFetch(`/pricing_plans/${id}`, PricingPlanDetailResponseSchema);
    }
}