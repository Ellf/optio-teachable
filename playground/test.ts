import { config } from 'dotenv';
import { resolve } from 'path';
import { TeachableClient } from '../src';

/**
 * @module test
 * @description Manual integration test script for the Teachable API client.
 * Exercises all v1 endpoints against a real Teachable account to verify
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

// Load the .env file from the playground directory
config({ path: resolve(__dirname, '.env') });

// ---------------------------------------------------------------------------
// Test IDs — update these if your school's data changes
// ---------------------------------------------------------------------------

const TEST_USER_ID         = 721238;    // Tom Lorimer (owner)
const TEST_COURSE_ID       = 63520;     // Course with known progress for TEST_USER_ID
const TEST_WEBHOOK_ID      = 789179;    // Registered webhook on the school
const QUIZ_COURSE_ID       = 294253;    // Course containing a quiz lecture
const QUIZ_LECTURE_ID      = 4532770;   // Lecture with a quiz attached
const QUIZ_ID              = 122228248; // Quiz ID from the above lecture
const VIDEO_COURSE_ID      = 1886748;   // RAINBOW TEMPLATE course
const VIDEO_LECTURE_ID     = 42809204;  // "1️⃣ Introduction and Welcome" lecture

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pass(label: string) {
    console.log(`  ✅ ${label}`);
}

function fail(label: string, error: unknown) {
    console.error(`  ❌ ${label}`);
    console.error(`     ${error}`);
}

async function test(label: string, fn: () => Promise<void>) {
    try {
        await fn();
        pass(label);
    } catch (error) {
        fail(label, error);
    }
}

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

/**
 * Runs a full suite of integration tests against all Teachable v1 API endpoints.
 * Tests are grouped by resource and run sequentially.
 * Each test logs a pass or fail independently so a single failure does not
 * halt the entire suite.
 *
 * @returns {Promise<void>}
 */
async function runTests() {
    const apiKey = process.env.TEACHABLE_API_KEY;

    if (!apiKey) {
        console.error('❌ ERROR: TEACHABLE_API_KEY is missing from playground/.env');
        process.exit(1);
    }

    console.log('🔑 Initialising TeachableClient...\n');
    const teachable = new TeachableClient(apiKey);

    // -----------------------------------------------------------------------
    // Users
    // -----------------------------------------------------------------------
    console.log('👤 Users');

    await test('users.getList()', async () => {
        const { users, meta } = await teachable.v1.users.getList(1, 5);
        if (!users.length) throw new Error('No users returned');
        console.log(`     Total users: ${meta?.total} | First: ${users[0]?.email}`);
    });

    await test('users.getList() with email filter', async () => {
        const { users } = await teachable.v1.users.getList(1, 5, {
            email: 'tom@purplehippo.io',
        });
        if (!users.length) throw new Error('No users returned for email filter');
        console.log(`     Found user ID: ${users[0]?.id}`);
    });

    await test('users.getById()', async () => {
        const user = await teachable.v1.users.getById(TEST_USER_ID);
        if (!user.id) throw new Error('No user ID returned');
        console.log(`     Name: ${user.name} | Role: ${user.role} | Courses: ${user.courses?.length}`);
    });

    await test('users.getByEmail()', async () => {
        const { users } = await teachable.v1.users.getByEmail('tom@purplehippo.io');
        if (!users.length) throw new Error('No users returned for email lookup');
        console.log(`     Found: ${users[0]?.email} (ID: ${users[0]?.id})`);
    });

    // -----------------------------------------------------------------------
    // Courses
    // -----------------------------------------------------------------------
    console.log('\n📚 Courses');

    await test('courses.getList()', async () => {
        const { courses, meta } = await teachable.v1.courses.getList(1, 5);
        if (!courses.length) throw new Error('No courses returned');
        console.log(`     Total courses: ${meta?.total} | First: ${courses[0]?.name}`);
    });

    await test('courses.getList() with filters', async () => {
        const { courses } = await teachable.v1.courses.getList(1, 5, {
            isPublished: true,
        });
        if (!courses.length) throw new Error('No published courses returned');
        console.log(`     Published courses returned: ${courses.length}`);
    });

    await test('courses.getById()', async () => {
        const { course } = await teachable.v1.courses.getById(TEST_COURSE_ID);
        if (!course.id) throw new Error('No course ID returned');
        console.log(`     Name: ${course.name} | Sections: ${course.lecture_sections?.length}`);
    });

    await test('courses.getEnrolments()', async () => {
        const { enrollments, meta } = await teachable.v1.courses.getEnrolments(TEST_COURSE_ID, 1, 5);
        console.log(`     Total enrolled: ${meta?.total} | Returned: ${enrollments.length}`);
    });

    await test('courses.getProgress()', async () => {
        const { course_progress } = await teachable.v1.courses.getProgress(TEST_COURSE_ID, TEST_USER_ID);
        console.log(`     Percent complete: ${course_progress.percent_complete}% | Certificate issued: ${course_progress.certificate.issued_at ?? 'none'}`);
    });

    await test('courses.getLecture()', async () => {
        const { lecture } = await teachable.v1.courses.getLecture(QUIZ_COURSE_ID, QUIZ_LECTURE_ID);
        if (!lecture.id) throw new Error('No lecture ID returned');
        console.log(`     Lecture: ${lecture.name} | Attachments: ${lecture.attachments?.length}`);
    });

    await test('courses.getQuizIds()', async () => {
        const { quiz_ids } = await teachable.v1.courses.getQuizIds(QUIZ_COURSE_ID, QUIZ_LECTURE_ID);
        if (!quiz_ids.length) throw new Error('No quiz IDs returned');
        console.log(`     Quiz IDs: ${quiz_ids.join(', ')}`);
    });

    await test('courses.getQuiz()', async () => {
        const { quiz } = await teachable.v1.courses.getQuiz(QUIZ_COURSE_ID, QUIZ_LECTURE_ID, QUIZ_ID);
        if (!quiz.id) throw new Error('No quiz ID returned');
        console.log(`     Quiz ID: ${quiz.id} | Questions: ${quiz.quiz.questions.length}`);
    });

    await test('courses.getQuizResponses()', async () => {
        const { quiz_responses } = await teachable.v1.courses.getQuizResponses(QUIZ_COURSE_ID, QUIZ_LECTURE_ID, QUIZ_ID);
        console.log(`     Course: ${quiz_responses.course_name} | Responses: ${quiz_responses.responses.length}`);
    });

    await test('courses.getVideo()', async () => {
        const { video } = await teachable.v1.courses.getVideo(VIDEO_COURSE_ID, VIDEO_LECTURE_ID, 111817954);
        if (!video.id) throw new Error('No video ID returned');
        console.log(`     Video ID: ${video.id} | Duration: ${video.media_duration}s | Status: ${video.status}`);
    });

    // -----------------------------------------------------------------------
    // Transactions
    // -----------------------------------------------------------------------
    console.log('\n💳 Transactions');

    await test('transactions.getList()', async () => {
        const { transactions, meta } = await teachable.v1.transactions.getList(1, 5);
        console.log(`     Total transactions: ${meta?.total} | First ID: ${transactions[0]?.id}`);
    });

    await test('transactions.getList() with filters', async () => {
        const { transactions } = await teachable.v1.transactions.getList(1, 5, {
            userId: TEST_USER_ID,
        });
        console.log(`     Transactions for user ${TEST_USER_ID}: ${transactions.length}`);
    });

    await test('transactions.getList() with user filter', async () => {
        const { transactions } = await teachable.v1.transactions.getList(1, 5, {
            userId: TEST_USER_ID,
        });
        console.log(`     Transactions for user ${TEST_USER_ID}: ${transactions.length}`);
    });

    // -----------------------------------------------------------------------
    // Pricing Plans
    // -----------------------------------------------------------------------
    console.log('\n💰 Pricing Plans');

    await test('pricingPlans.getList()', async () => {
        const { pricing_plans, meta } = await teachable.v1.pricingPlans.getList(1, 5);
        console.log(`     Total pricing plans: ${meta?.total} | First: ${pricing_plans[0]?.name}`);
    });

    await test('pricingPlans.getById()', async () => {
        const { pricing_plans } = await teachable.v1.pricingPlans.getList(1, 1);
        if (!pricing_plans.length) throw new Error('No pricing plans to test getById with');
        const firstId = pricing_plans[0]!.id;
        const { pricing_plan } = await teachable.v1.pricingPlans.getById(firstId);
        console.log(`     ID: ${pricing_plan.id} | Name: ${pricing_plan.name} | Price: ${pricing_plan.price} ${pricing_plan.currency}`);
    });

    // -----------------------------------------------------------------------
    // Webhooks
    // -----------------------------------------------------------------------
    console.log('\n🪝 Webhooks');

    await test('webhooks.getList()', async () => {
        const { webhooks } = await teachable.v1.webhooks.getList();
        console.log(`     Total webhooks: ${webhooks.length} | First trigger: ${webhooks[0]?.event_trigger}`);
    });

    await test('webhooks.getEvents()', async () => {
        const { events, meta } = await teachable.v1.webhooks.getEvents(TEST_WEBHOOK_ID, 1, 5);
        console.log(`     Total events: ${meta?.total} | Returned: ${events.length}`);
    });

    await test('webhooks.getEvents() with status filter', async () => {
        const { events } = await teachable.v1.webhooks.getEvents(TEST_WEBHOOK_ID, 1, 5, {
            responseHttpStatusGte: 200,
            responseHttpStatusLte: 299,
        });
        console.log(`     Successful deliveries returned: ${events.length}`);
    });

    // -----------------------------------------------------------------------
    // Advanced
    // -----------------------------------------------------------------------
    console.log('\n🔧 Advanced');

    await test('getRaw()', async () => {
        const data = await teachable.v1.getRaw('/users?page=1&per=1');
        if (!data) throw new Error('No data returned from getRaw');
        console.log(`     getRaw returned data successfully`);
    });

    console.log('\n🏁 All tests completed.');
}

runTests();