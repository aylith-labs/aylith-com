/** Only a provider-verified server classification chooses an app or the stock login. */
export function originalLoginRequest(params: URLSearchParams): string | null {
  const requests = params.getAll('authRequest');
  const request = requests[0];
  return requests.length === 1 && typeof request === 'string' && /^V2_[A-Za-z0-9_-]{3,128}$/.test(request)
    ? request
    : null;
}
export function resolvedLoginTarget(authRequest: string, value: unknown): string | null {
  if (!/^V2_[A-Za-z0-9_-]{3,128}$/.test(authRequest) || !value || typeof value !== 'object' || Array.isArray(value)) return null;
  const result = value as Record<string, unknown>;
  if (Object.keys(result).length !== 1 || !Object.hasOwn(result, 'applicationId')) return null;
  if (result.applicationId === null) {
    const target = new URL('https://auth.aylith.com/ui/v2/login');
    target.searchParams.set('authRequest', authRequest);
    return target.href;
  }
  return typeof result.applicationId === 'string' && /^[a-z][a-z0-9-]{0,47}$/.test(result.applicationId)
    ? `/login/${result.applicationId}?authRequest=${encodeURIComponent(authRequest)}`
    : null;
}
