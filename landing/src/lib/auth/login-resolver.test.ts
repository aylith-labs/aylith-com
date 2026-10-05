import { describe, expect, it } from 'vitest';
import { originalLoginRequest, resolvedLoginTarget } from './login-resolver';

describe('original provider request and trusted app classification', () => {
  it('preserves the exact original request through app and stock routes', () => {
    const request = originalLoginRequest(new URLSearchParams('authRequest=V2_request'));
    expect(request).toBe('V2_request');
    if (!request) throw new Error('Expected verified original request');
    expect(resolvedLoginTarget(request, { applicationId: 'agentry' })).toBe('/login/agentry?authRequest=V2_request');
    expect(resolvedLoginTarget(request, { applicationId: null })).toBe('https://auth.aylith.com/ui/v2/login?authRequest=V2_request');
  });
  it.each(['', 'authRequest=', 'authRequest=V2_request&authRequest=V2_other', 'authRequest=https://evil.example', 'authRequest=V1_request'])('rejects malformed or duplicate authority %s', query => {
    expect(originalLoginRequest(new URLSearchParams(query))).toBeNull();
  });
  it.each([{}, [], { applicationId: 'https://evil.example' }, { applicationId: '../other' }, { applicationId: '' }, { applicationId: 'agentry', destination: 'https://evil.example' }, { applicationId: true }])('rejects untrusted classification %#', value => {
    expect(resolvedLoginTarget('V2_request', value)).toBeNull();
  });
  it('cannot redirect an invalid request even with a valid classification', () => {
    expect(resolvedLoginTarget('unverified', { applicationId: 'agentry' })).toBeNull();
  });
});
