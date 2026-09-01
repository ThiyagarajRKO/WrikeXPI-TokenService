export interface RootLoginInit {
  environments: string[];
  selectedEnvironment: string;
  redirectUrl: string;
  redirectUri: string;
  accountId: string;
}

declare global {
  interface Window {
    __ROOT_LOGIN_INIT__?: RootLoginInit;
  }
}

/** Injected server-side by src/index.js's GET / handler (see findRedirectionURL). */
export const getInit = (): RootLoginInit =>
  window.__ROOT_LOGIN_INIT__ ?? {
    environments: [],
    selectedEnvironment: "",
    redirectUrl: "",
    redirectUri: "",
    accountId: "",
  };

/**
 * GET /get-redirect-url — same endpoint the original inline script already
 * calls whenever the environment dropdown changes.
 */
export const fetchRedirectUrl = async (params: {
  environment?: string;
  redirectUri?: string;
  accountId?: string;
}): Promise<string | null> => {
  const query = new URLSearchParams();
  if (params.environment) query.append("environment", params.environment);
  if (params.redirectUri) query.append("redirectUri", params.redirectUri);
  if (params.accountId) query.append("accountId", params.accountId);

  try {
    const res = await fetch(`/get-redirect-url?${query.toString()}`);
    const data = await res.json();
    return data.success && data.redirectUrl ? data.redirectUrl : null;
  } catch {
    return null;
  }
};
