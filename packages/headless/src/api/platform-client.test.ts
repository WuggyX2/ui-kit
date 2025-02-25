import fetch from 'cross-fetch';
import * as BackOff from 'exponential-backoff';
import pino from 'pino';
import {allValidPlatformCombination} from '../test/platform-url';
import {ExpiredTokenError} from '../utils/errors';
import {
  platformUrl,
  PlatformClient,
  PlatformClientCallOptions,
  analyticsUrl,
} from './platform-client';
import {
  NoopPreprocessRequest,
  PlatformRequestOptions,
} from './preprocess-request';

jest.mock('cross-fetch');

const {Response} = jest.requireActual('node-fetch');
const mockFetch = fetch as jest.Mock;

describe('url helper', () => {
  it('return the correct #platformUrl()', () => {
    allValidPlatformCombination().forEach((expectation) => {
      expect(platformUrl(expectation)).toEqual(expectation.platform);
    });
  });

  it('return the correct #analyticsUrl()', () => {
    allValidPlatformCombination().forEach((expectation) => {
      expect(analyticsUrl(expectation)).toEqual(
        expectation.analytics.split('/rest')[0]
      );
    });
  });
});

describe('PlatformClient call', () => {
  function platformCall(options: Partial<PlatformClientCallOptions> = {}) {
    return PlatformClient.call({
      accessToken: 'accessToken1',
      contentType: 'application/json',
      method: 'POST',
      requestParams: {
        test: 123,
      },
      url: platformUrl(),
      preprocessRequest: NoopPreprocessRequest,
      logger: pino({level: 'silent'}),
      origin: 'searchApiFetch',
      ...options,
    });
  }

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should call fetch with the right parameters', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve(new Response(JSON.stringify({})))
    );

    await platformCall();

    expect(mockFetch).toHaveBeenCalledWith(platformUrl(), {
      body: JSON.stringify({
        test: 123,
      }),
      headers: {
        Authorization: 'Bearer accessToken1',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  });

  it('should preprocess the request if a middleware is provided', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve(new Response(JSON.stringify({})))
    );
    const middleware = (request: PlatformRequestOptions) => {
      return {
        ...request,
        headers: {
          ...request.headers,
          test: 'header',
        },
      };
    };
    await platformCall({preprocessRequest: middleware});

    expect(mockFetch).toHaveBeenCalledWith(platformUrl(), {
      body: JSON.stringify({
        test: 123,
      }),
      headers: {
        Authorization: 'Bearer accessToken1',
        'Content-Type': 'application/json',
        test: 'header',
      },
      method: 'POST',
    });
  });

  it(`when the contentType is www-url-form-encoded and the #requestParams can be encoded,
  it encodes the body as a url`, async () => {
    await platformCall({
      contentType: 'application/x-www-form-urlencoded',
      requestParams: {q: 'hello', page: 5},
    });

    expect(mockFetch).toHaveBeenCalledWith(
      platformUrl(),
      expect.objectContaining({body: 'q=hello&page=5'})
    );
  });

  it(`when the contentType is www-url-form-encoded and the #requestParams cannot be encoded,
  it sends an empty string`, async () => {
    await platformCall({
      method: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      requestParams: {q: {}},
    });

    expect(mockFetch).toHaveBeenCalledWith(
      platformUrl(),
      expect.objectContaining({body: ''})
    );
  });

  it('when the contentType is unrecognized, it encodes the request params as JSON', async () => {
    const requestParams = {q: 'a'};
    await platformCall({contentType: undefined, requestParams});

    expect(mockFetch).toHaveBeenCalledWith(
      platformUrl(),
      expect.objectContaining({body: JSON.stringify(requestParams)})
    );
  });

  it('when the method is POST, #body should be present', async () => {
    await platformCall({
      method: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      requestParams: {q: 'hello', page: 5},
    });

    expect(mockFetch).toHaveBeenCalledWith(
      platformUrl(),
      expect.objectContaining({body: 'q=hello&page=5'})
    );
  });

  it('when the method is PUT, #body is used for body', async () => {
    await platformCall({
      method: 'PUT',
      contentType: 'application/x-www-form-urlencoded',
      requestParams: {q: 'hello', page: 5},
    });

    expect(mockFetch).toHaveBeenCalledWith(
      platformUrl(),
      expect.objectContaining({body: 'q=hello&page=5'})
    );
  });

  it('when the method is GET, #body should be absent', async () => {
    await platformCall({
      method: 'GET',
      contentType: 'application/x-www-form-urlencoded',
      requestParams: {q: 'hello', page: 5},
    });

    expect(mockFetch).toHaveBeenCalledWith(
      platformUrl(),
      expect.not.objectContaining({body: expect.anything()})
    );
  });

  it('when the method is DELETE, #body should be absent', async () => {
    await platformCall({
      method: 'DELETE',
      contentType: 'application/x-www-form-urlencoded',
      requestParams: {q: 'hello', page: 5},
    });

    expect(mockFetch).toHaveBeenCalledWith(
      platformUrl(),
      expect.not.objectContaining({body: expect.anything()})
    );
  });

  it('when status is 419 should return a TokenExpiredError', async () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve(new Response(JSON.stringify({}), {status: 419}))
    );

    const response = await platformCall();
    expect(response).toBeInstanceOf(ExpiredTokenError);
  });

  it('when status is 429 should try exponential backOff', async () => {
    mockFetch
      .mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 429}))
      )
      .mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 429}))
      )
      .mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );

    await platformCall();

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should not throw when backOff rejects with a response', async () => {
    const spy = jest.spyOn(BackOff, 'backOff');
    const expectedResponse = new Response(JSON.stringify({hoho: 'oups'}), {
      status: 429,
    });
    spy.mockRejectedValueOnce(expectedResponse);

    const response = await platformCall();
    expect(response).toBe(expectedResponse);
  });

  it('should not throw when fetch throws a common error', async () => {
    const fetchError = new Error('Could not fetch');
    fetchError.name = 'FetchError';

    mockFetch.mockRejectedValue(fetchError);
    const response = await platformCall();

    expect(response).toBe(fetchError);
  });

  it('should return when there is an AbortError', async () => {
    const abortError = new Error();
    abortError.name = 'AbortError';

    mockFetch.mockRejectedValue(abortError);
    const response = await platformCall();
    expect(response).toBe(abortError);
  });
});
