import { afterEach, describe, expect, it, vi } from 'vitest';
import { TeachableClient } from '../src';
import { courseList, userList } from './fixtures';
import { lastUrl, mockFetch } from './helpers';

const BASE = 'https://developers.teachable.com/v1';

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('TeachableClient', () => {
    it('throws when no API key is given', () => {
        expect(() => new TeachableClient('')).toThrow('Teachable API Key is required');
    });

    it('exposes every v1 resource', () => {
        const { v1 } = new TeachableClient('key');
        expect(v1.users).toBeDefined();
        expect(v1.courses).toBeDefined();
        expect(v1.transactions).toBeDefined();
        expect(v1.webhooks).toBeDefined();
        expect(v1.pricingPlans).toBeDefined();
    });
});

describe('validated requests', () => {
    it('sends the API key and Accept header to the v1 base URL', async () => {
        const fetchMock = mockFetch(userList);
        await new TeachableClient('secret-key').v1.users.getById(101).catch(() => {});

        const [url, init] = fetchMock.mock.lastCall as unknown as [string, RequestInit];
        expect(url).toBe(`${BASE}/users/101`);
        expect(init.headers).toEqual({ apiKey: 'secret-key', Accept: 'application/json' });
    });

    it('returns the parsed response', async () => {
        mockFetch(userList);
        const result = await new TeachableClient('key').v1.users.getList();
        expect(result).toEqual(userList);
    });

    it('keeps unknown course fields, because CourseSchema is loose', async () => {
        mockFetch(courseList);
        const result = await new TeachableClient('key').v1.courses.getList();
        expect(result.courses[0]).toHaveProperty('extra_field', 'kept');
    });

    it('drops unknown fields on strict-shaped schemas', async () => {
        mockFetch({ ...userList, surprise: true });
        const result = await new TeachableClient('key').v1.users.getList();
        expect(result).not.toHaveProperty('surprise');
    });

    it('throws with the status and body when the API returns an error', async () => {
        mockFetch('{"error":"Not found"}', 404);
        await expect(new TeachableClient('key').v1.users.getById(1))
            .rejects.toThrow('Teachable V1 Error: 404 {"error":"Not found"}');
    });

    it('lists each field that fails the schema, by path', async () => {
        mockFetch({ users: [{ id: 'not-a-number', email: 'ada@example.com' }] });

        const error = await new TeachableClient('key').v1.users.getList().then(
            () => { throw new Error('expected getList to reject'); },
            (e: Error) => e,
        );

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toMatch(/^Teachable API response did not match expected schema\.\n/);
        expect(error.message).toContain('  - users.0.id: ');
    });
});

describe('getRaw', () => {
    it('returns the response without validating it', async () => {
        const body = { anything: ['goes'] };
        const fetchMock = mockFetch(body);
        vi.spyOn(console, 'log').mockImplementation(() => {});

        const result = await new TeachableClient('key').v1.getRaw('/enrollments');

        expect(result).toEqual(body);
        expect(lastUrl(fetchMock)).toBe(`${BASE}/enrollments`);
    });

    it('logs nothing when debug is off', async () => {
        mockFetch({});
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        await new TeachableClient('key').v1.getRaw('/users');
        expect(log).not.toHaveBeenCalled();
    });

    it('logs the request and response when debug is on', async () => {
        mockFetch({ ok: 1 });
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        await new TeachableClient('key', true).v1.getRaw('/users');
        expect(log).toHaveBeenCalledWith(`[Teachable Debug] 📡 GET ${BASE}/users`);
        expect(log).toHaveBeenCalledTimes(2);
    });

    it('logs when asked for one call, even with debug off', async () => {
        mockFetch({});
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        await new TeachableClient('key').v1.getRaw('/users', true);
        expect(log).toHaveBeenCalledTimes(2);
    });

    it('throws with the status on an error response', async () => {
        mockFetch('boom', 500);
        vi.spyOn(console, 'error').mockImplementation(() => {});
        await expect(new TeachableClient('key').v1.getRaw('/users'))
            .rejects.toThrow('Raw Fetch Error: 500');
    });
});
