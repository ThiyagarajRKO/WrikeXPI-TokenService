import fs from "fs";
import { portalAuthRoute } from "./auth";
import { portalUsersRoute } from "./users";
import { portalEnvironmentsRoute } from "./environments";

// Page handlers
const PortalIndexPage = (req, reply) => reply.redirect("/portal/login");

// Served from the React build (frontend/ -> public/app/, see
// src/plugins/appStatic.js) instead of an EJS template.
const PortalLoginPage = (req, reply) => {
  try {
    return reply.sendFile("portal-login.html", process.cwd() + "/public/app");
  } catch (err) {
    return reply.code(500).send({ error: "Failed to load login page" });
  }
};

const PortalChangePasswordPage = (req, reply) => {
  try {
    return reply.sendFile(
      "portal-change-password.html",
      process.cwd() + "/public/app",
    );
  } catch (err) {
    return reply
      .code(500)
      .send({ error: "Failed to load change password page" });
  }
};

const PortalDashboardPage = (req, reply) => {
  try {
    return reply.sendFile("portal-dashboard.html", process.cwd() + "/public/app");
  } catch (err) {
    return reply.code(500).send({ error: "Failed to load dashboard" });
  }
};

// Served from the React build (frontend/ -> public/app/, see
// src/plugins/appStatic.js). Unlike the other portal pages, this one has
// genuine server-only state (APP_URL / WRIKE_REDIRECT_URL env vars), so it's
// injected into the served HTML as window.__PORTAL_HOME_INIT__, mirroring
// src/index.js's GET / -> window.__ROOT_LOGIN_INIT__ pattern.
const PortalUserPage = (req, reply) => {
  try {
    const initData = {
      appUrl: process.env.APP_URL || "",
      wrikeRedirectUrl: process.env.WRIKE_REDIRECT_URL || "",
    };

    const template = fs.readFileSync(
      process.cwd() + "/public/app/portal-home.html",
      "utf8",
    );
    const html = template.replace(
      '<div id="root"></div>',
      `<div id="root"></div>\n    <script>window.__PORTAL_HOME_INIT__ = ${JSON.stringify(initData)};</script>`,
    );

    return reply.type("text/html").send(html);
  } catch (err) {
    return reply.code(500).send({ error: "Failed to load user page" });
  }
};

// Page routes (rendered views)
export const portalRoute = (fastify, opts, done) => {
  fastify.get("/", PortalIndexPage);
  fastify.get("/login", PortalLoginPage);
  fastify.get("/change-password", PortalChangePasswordPage);
  fastify.get("/dashboard", PortalDashboardPage);
  fastify.get("/home", PortalUserPage);

  done();
};

// API routes
export const portalApiRoute = (fastify, opts, done) => {
  fastify.register(portalAuthRoute, { prefix: "/auth" });
  fastify.register(portalUsersRoute, { prefix: "/users" });
  fastify.register(portalEnvironmentsRoute, { prefix: "/environments" });

  done();
};
