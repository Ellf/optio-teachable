import { afterEach, describe, expect, it, vi } from 'vitest';
import { TeachableClient } from '../src';
import * as fx from './fixtures';
import { lastUrl, mockFetch } from './helpers';

const BASE = 'https://developers.teachable.com/v1';

afterEach(() => {
    vi.unstubAllGlobals();
});

type V1 = TeachableClient['v1'];

/**
 * Each case: the call, the URL it should request (after the base URL), and
 * a sample response for the schema that call validates against.
 */
const cases: Array<[name: string, call: (v1: V1) => Promise<unknown>, path: string, response: unknown]> = [
    // Users
    ['users.getList defaults', (v1) => v1.users.getList(), '/users?page=1&per=20', fx.userList],
    ['users.getList with filters', (v1) => v1.users.getList(2, 50, { email: 'ada@example.com', searchAfter: 100 }),
        '/users?page=2&per=50&email=ada%40example.com&search_after=100', fx.userList],
    ['users.getById', (v1) => v1.users.getById(101), '/users/101', fx.userDetail],
    ['users.getByEmail', (v1) => v1.users.getByEmail('a+b@example.com'), '/users?email=a%2Bb%40example.com', fx.userList],

    // Courses
    ['courses.getList defaults', (v1) => v1.courses.getList(), '/courses?page=1&per=20', fx.courseList],
    ['courses.getList with filters', (v1) => v1.courses.getList(1, 10, {
        name: 'Intro', isPublished: true, authorBioId: 9, createdAt: '2026-01-01',
    }), '/courses?page=1&per=10&name=Intro&is_published=true&author_bio_id=9&created_at=2026-01-01', fx.courseList],
    ['courses.getList sends isPublished=false', (v1) => v1.courses.getList(1, 20, { isPublished: false }),
        '/courses?page=1&per=20&is_published=false', fx.courseList],
    ['courses.getById', (v1) => v1.courses.getById(501), '/courses/501', fx.courseDetail],
    ['courses.getEnrolments defaults', (v1) => v1.courses.getEnrolments(501), '/courses/501/enrollments?page=1&per=20', fx.enrolments],
    ['courses.getEnrolments with filters', (v1) => v1.courses.getEnrolments(501, 3, 5, {
        enrolledInAfter: '2026-01-01', enrolledInBefore: '2026-02-01', sortDirection: 'desc',
    }), '/courses/501/enrollments?page=3&per=5&enrolled_in_after=2026-01-01&enrolled_in_before=2026-02-01&sort_direction=desc', fx.enrolments],
    ['courses.getLecture', (v1) => v1.courses.getLecture(501, 3001), '/courses/501/lectures/3001', fx.lectureDetail],
    ['courses.getProgress', (v1) => v1.courses.getProgress(501, 101), '/courses/501/progress?user_id=101&page=1&per=20', fx.courseProgress],
    ['courses.getQuizIds', (v1) => v1.courses.getQuizIds(501, 3001), '/courses/501/lectures/3001/quizzes', fx.quizIds],
    ['courses.getQuiz', (v1) => v1.courses.getQuiz(501, 3001, 7001), '/courses/501/lectures/3001/quizzes/7001', fx.lectureQuiz],
    ['courses.getQuizResponses', (v1) => v1.courses.getQuizResponses(501, 3001, 7001),
        '/courses/501/lectures/3001/quizzes/7001/responses', fx.quizResponses],
    ['courses.getVideo without a user', (v1) => v1.courses.getVideo(501, 3001, 8801), '/courses/501/lectures/3001/videos/8801', fx.lectureVideo],
    ['courses.getVideo for a user', (v1) => v1.courses.getVideo(501, 3001, 8801, { userId: 101 }),
        '/courses/501/lectures/3001/videos/8801?user_id=101', fx.lectureVideo],

    // Transactions
    ['transactions.getList defaults', (v1) => v1.transactions.getList(), '/transactions?page=1&per=20', fx.transactions],
    ['transactions.getList with filters', (v1) => v1.transactions.getList(1, 20, {
        userId: 101, affiliateId: 2, courseId: 501, pricingPlanId: 701,
        isFullyRefunded: false, isChargeback: true, startDate: '2026-01-01', endDate: '2026-02-01',
    }), '/transactions?page=1&per=20&user_id=101&affiliate_id=2&course_id=501&pricing_plan_id=701'
        + '&is_fully_refunded=false&is_chargeback=true&start_date=2026-01-01&end_date=2026-02-01', fx.transactions],

    // Webhooks
    ['webhooks.getList', (v1) => v1.webhooks.getList(), '/webhooks', fx.webhooks],
    ['webhooks.getEvents defaults', (v1) => v1.webhooks.getEvents(901), '/webhooks/901/events?page=1&per=20', fx.webhookEvents],
    ['webhooks.getEvents with filters', (v1) => v1.webhooks.getEvents(901, 1, 20, {
        responseHttpStatusGte: 0, responseHttpStatusLte: 299, createdBefore: '2026-02-01', createdAfter: '2026-01-01',
    }), '/webhooks/901/events?page=1&per=20&response_http_status_gte=0&response_http_status_lte=299'
        + '&created_before=2026-02-01&created_after=2026-01-01', fx.webhookEvents],

    // Pricing plans
    ['pricingPlans.getList defaults', (v1) => v1.pricingPlans.getList(), '/pricing_plans?page=1&per=20', fx.pricingPlans],
    ['pricingPlans.getById', (v1) => v1.pricingPlans.getById(701), '/pricing_plans/701', fx.pricingPlanDetail],
];

describe('endpoints', () => {
    it.each(cases)('%s', async (_name, call, path, response) => {
        const fetchMock = mockFetch(response);
        const result = await call(new TeachableClient('key').v1);

        expect(lastUrl(fetchMock)).toBe(`${BASE}${path}`);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result).toBeDefined();
    });
});
