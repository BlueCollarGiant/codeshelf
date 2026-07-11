import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import {
  deleteAll,
  getAllRepos,
  getAuthenticatedOwnerLogin,
  isOwnedByAuthenticatedUser,
  setVisibilityForAll,
} from './github.service.js';

function mockResponse({ status = 200, body = {}, headers = {} } = {}) {
  const normalizedHeaders = new Map(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );

  return {
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get(name) {
        return normalizedHeaders.get(name.toLowerCase()) ?? null;
      },
    },
    async json() {
      return body;
    },
  };
}

describe('GitHub repository ownership boundary', () => {
  let originalFetch;
  let originalToken;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    originalToken = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = 'test-token';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = originalToken;
  });

  it('requests only repositories owned by the authenticated account', async () => {
    let requestedUrl = '';
    globalThis.fetch = async (url) => {
      requestedUrl = String(url);
      return mockResponse({ body: [], headers: { link: '' } });
    };

    await getAllRepos();

    const url = new URL(requestedUrl);
    assert.equal(url.pathname, '/user/repos');
    assert.equal(url.searchParams.get('affiliation'), 'owner');
  });

  it('matches repository ownership case-insensitively', () => {
    assert.equal(isOwnedByAuthenticatedUser('BlueCollarGiant/codeshelf', 'bluecollargiant'), true);
    assert.equal(isOwnedByAuthenticatedUser('another-user/codeshelf', 'bluecollargiant'), false);
    assert.equal(isOwnedByAuthenticatedUser('invalid-name', 'bluecollargiant'), false);
  });

  it('blocks visibility changes for collaborator repositories before GitHub is called', async () => {
    let fetchCalls = 0;
    globalThis.fetch = async () => {
      fetchCalls++;
      return mockResponse();
    };

    const results = await setVisibilityForAll(
      [{ fullName: 'another-user/shared-repo', visibility: 'private' }],
      'bluecollargiant',
    );

    assert.equal(fetchCalls, 0);
    assert.equal(results[0].success, false);
    assert.match(results[0].message, /only changes repositories owned/i);
  });

  it('allows visibility changes for an owned repository', async () => {
    let requestedUrl = '';
    globalThis.fetch = async (url, options) => {
      requestedUrl = String(url);
      assert.equal(options.method, 'PATCH');
      return mockResponse();
    };

    const results = await setVisibilityForAll(
      [{ fullName: 'BlueCollarGiant/codeshelf', visibility: 'private' }],
      'bluecollargiant',
    );

    assert.equal(results[0].success, true);
    assert.match(requestedUrl, /\/repos\/BlueCollarGiant\/codeshelf$/);
  });

  it('blocks collaborator and profile repository deletion before GitHub is called', async () => {
    let fetchCalls = 0;
    globalThis.fetch = async () => {
      fetchCalls++;
      return mockResponse({ status: 204 });
    };

    const results = await deleteAll(
      [
        { fullName: 'another-user/shared-repo' },
        { fullName: 'BlueCollarGiant/BlueCollarGiant' },
      ],
      'bluecollargiant',
    );

    assert.equal(fetchCalls, 0);
    assert.equal(results[0].success, false);
    assert.match(results[0].message, /only deletes repositories owned/i);
    assert.equal(results[1].success, false);
    assert.match(results[1].message, /profile repo/i);
  });

  it('fails closed when GitHub does not return an authenticated login', async () => {
    globalThis.fetch = async () => mockResponse({ body: { name: 'Missing login' } });

    await assert.rejects(
      getAuthenticatedOwnerLogin(),
      err => err?.status === 502 && /actions were blocked/i.test(err.message),
    );
  });
});
