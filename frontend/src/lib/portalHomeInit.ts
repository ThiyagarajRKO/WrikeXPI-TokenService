export interface PortalHomeInit {
  appUrl: string;
  wrikeRedirectUrl: string;
}

declare global {
  interface Window {
    __PORTAL_HOME_INIT__?: PortalHomeInit;
  }
}

/**
 * Injected server-side by src/routes/portal/index.js's GET /home handler
 * (PortalUserPage) — mirrors src/index.js's GET / -> window.__ROOT_LOGIN_INIT__
 * pattern. appUrl/wrikeRedirectUrl come from process.env.APP_URL /
 * process.env.WRIKE_REDIRECT_URL, which only the server knows, so they can't
 * be derived client-side the way the other migrated pages' state can.
 */
export const getPortalHomeInit = (): PortalHomeInit =>
  window.__PORTAL_HOME_INIT__ ?? { appUrl: "", wrikeRedirectUrl: "" };
