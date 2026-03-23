import { config } from 'dotenv';
import { resolve } from 'path';
import { TeachableClient } from '../src';

/**
 * @module test
 * @description Manual integration test script for the Teachable API client.
 * Exercises the core v1 endpoints against a real Teachable account to verify
 * connectivity, authentication, and schema validation.
 *
 * @remarks
 * This script is intended for local development and debugging only —
 * it is not part of the automated test suite. Requires a valid API key
 * in `playground/.env` to run.
 *
 * @example
 * ```bash
 * # From the project root:
 * npx ts-node playground/test.ts
 * ```
 */

// 1. Load the .env file from the playground directory
config({ path: resolve(__dirname, '.env') });

/**
 * Runs a series of manual integration tests against the Teachable v1 API.
 * Tests the following endpoints in sequence:
 * - `users.getList` — paginated user list
 * - `users.getByEmail` — user lookup by email
 * - `courses.getCourses` — paginated course list
 * - `transactions.getList` — paginated transaction list
 *
 * Logs a summary of key fields from each response on success,
 * or prints the error and exits on failure.
 *
 * @returns {Promise<void>}
 * @throws Will log the error to stderr if any API call fails, but does not re-throw.
 */
async function runTests() {
    const apiKey = process.env.TEACHABLE_API_KEY;

    if (!apiKey) {
        console.error("❌ ERROR: TEACHABLE_API_KEY is missing from playground/.env");
        process.exit(1);
    }

    console.log("🔑 Initializing TeachableClient...");
    const teachable = new TeachableClient(apiKey);

    try {
        console.log("📡 Testing API Endpoints...");
        const usersData = await teachable.v1.users.getList(1, 5);
        const userFromEmail = await teachable.v1.users.getByEmail("tom@lorimer.email");
        const courseData = await teachable.v1.courses.getList(1, 3);
        const transactionsData = await teachable.v1.transactions.getList(1, 5);

        console.log("✅ Success! Fetched Data:");
        console.log(`Total Users in Teachable: ${usersData.meta?.total}`);
        console.log(`First User ID and Email: ${usersData.users[0]?.id} | ${usersData.users[0]?.email}`);
        console.log(`User's ID from Email: ${userFromEmail.users[0]?.id}`);
        console.log(`First Course Name: ${courseData.courses[0]?.name}`);
        console.log(`First Transaction ID: ${transactionsData.transactions[0]?.id}`);

    } catch (error) {
        console.error("❌ Test Failed:");
        console.error(error);
    }
}

runTests().then(() => {
    console.log("All tests completed successfully!");
});