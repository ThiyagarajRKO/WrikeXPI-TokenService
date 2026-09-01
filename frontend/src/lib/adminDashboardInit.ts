export interface AdminDashboardInit {
  appUrl: string;
  wrikeRedirectUrl: string;
}

declare global {
  interface Window {
    __ADMIN_DASHBOARD_INIT__?: AdminDashboardInit;
  }
}

/**
 * Injected server-side by src/routes/admin/index.js's GET /dashboard handler
 * (AdminDashboardPage) — mirrors src/index.js's GET / -> window.__ROOT_LOGIN_INIT__
 * and src/routes/portal/index.js's GET /home -> window.__PORTAL_HOME_INIT__
 * patterns. appUrl/wrikeRedirectUrl come from process.env.APP_URL /
 * process.env.WRIKE_REDIRECT_URL, which only the server knows, so they can't
 * be derived client-side the way the other migrated pages' state can.
 */
export const getAdminDashboardInit = (): AdminDashboardInit =>
  window.__ADMIN_DASHBOARD_INIT__ ?? { appUrl: "", wrikeRedirectUrl: "" };
