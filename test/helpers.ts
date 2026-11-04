import { vi } from 'vitest';

/**
 * Replaces global fetch with a mock that answers every request with `body`
 * and `status`. Returns the mock so tests can inspect the calls.
 */
export function mockFetch(body: unknown, status = 200) {
    const fetchMock = vi.fn(async () => {
        const text = typeof body === 'string' ? body : JSON.stringify(body);
        return new Response(text, {
            status,
            headers: { 'Content-Type': 'application/json' },
        });
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

/** The URL passed to the most recent fetch call. */
export function lastUrl(fetchMock: ReturnType<typeof mockFetch>): string {
    const call = fetchMock.mock.lastCall as unknown as [string, RequestInit];
    return call[0];
}
