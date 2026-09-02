"use strict";

// Importing Modules to Start Server
import AutoLoad from "@fastify/autoload";
import path from "path";
import Fastify from "fastify";
import dotenv from "dotenv";
dotenv.config();

// Importing Routes
import { PrivateRouters, PublicRouters } from "./routes";
import { adminRoute } from "./routes/admin";
import { portalRoute } from "./routes/portal";
import oauthWellKnownRoute from "./routes/oauth/wellKnown";
import oauthRoute from "./routes/oauth";
import mcpDocsRoute from "./routes/mcpDocs";
import docsRoute from "./routes/docs";
import wrikeIconDataUri from "./mcp/wrikeIcon";
import { syncSecrets } from "./utils/azure_vault";
import { findRedirectionURL } from "./utils/wrikeRedirect";
import {
  syncWrikeCredentialsFromDB,
  getCachedVisibleWrikeCredentials,
} from "./utils/wrikeCredentials";

(async () => {
  // Configure the framework and instantiate it
  const fastify = Fastify({
    logger: true,
  });

  // app.use(express.static("public"));
  // app.set("view engine", "ejs");

  // This loads all plugins defined in plugins those should be support plugins that are reused through your application
  fastify.register(AutoLoad, {
    dir: path.join(process.cwd(), "/src/plugins"),
    ignorePattern: /mcp\.js/,
  });

  // fastify.get("/", (req, res) => {
  //   res.code(200).send({ message: "Server is running..." });
  // });

  //routes
  fastify.register(PublicRouters, { prefix: "/api/v1" });
  fastify.register(PrivateRouters, { prefix: "/api/v1" });
  fastify.register(adminRoute, { prefix: "/admin" });
  fastify.register(portalRoute, { prefix: "/portal" });

  // MCP OAuth (discovery metadata must live at the host root per RFC 8414/9728)
  fastify.register(oauthWellKnownRoute);
  fastify.register(oauthRoute, { prefix: "/oauth" });
  fastify.register(mcpDocsRoute);
  fastify.register(docsRoute);

  // Hooks
  fastify.addHook("onError", async (request, reply, error) => {
    console.log(new Date() + " : " + error?.message || error);
    reply.code(500).send({ success: false, message: error?.message || error });
  });

  // fastify.addHook("onSend", function (request, reply, payload, done) {
  //   try {
  //     if (!reply.sent && payload) {
  //       done(null, payload);
  //     }
  //   } catch (err) {
  //     console.error(new Date().toISOString() + " : " + err?.message || err);
  //   }
  // });

  // Health check endpoint
  fastify.all("/health", async (request, reply) => {
    const healthcheck = {
      uptime: process.uptime(),
      message: "OK",
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      version: process.version,
    };
    try {
      reply.code(200).send(healthcheck);
    } catch (error) {
      healthcheck.message = error;
      reply.code(503).send(healthcheck);
    }
  });

  // Sync Secrets from Azure Vault at Startup
  await syncSecrets([
    "XPI-API-ClientId",
    "XPI-API-ClientSecret",
    "XPI-API-Token",
  ]);

  // Sync Wrike Credentials from Database at Startup
  try {
    await syncWrikeCredentialsFromDB();
  } catch (err) {
    console.error(
      "Error syncing Wrike credentials from DB at startup:",
      err.message,
    );
  }

  fastify.get("/api/v1/sync-secrets", async (req, res) => {
    try {
      await syncSecrets([
        "XPI-API-ClientId",
        "XPI-API-ClientSecret",
        "XPI-API-Token",
      ]);
      console.log("Secrets synchronized successfully");
      res.send({ success: true, message: "Secrets synchronized successfully" });
    } catch (err) {
      res.status(500).send({ success: false, message: err.message || err });
    }
  });

  // Sync Wrike Credentials from Database
  fastify.get("/api/v1/sync-db-credentials", async (req, res) => {
    try {
      await syncWrikeCredentialsFromDB();
      console.log("Database credentials synchronized successfully");
      res.send({
        success: true,
        message: "Database credentials synchronized successfully",
      });
    } catch (err) {
      res.status(500).send({ success: false, message: err.message || err });
    }
  });

  // Root-level favicon — several tools (browsers, Claude.ai's connector
  // list icon lookup, etc.) fetch this conventional path directly rather
  // than reading the MCP serverInfo.icons field, so serve real bytes here
  // too (same icon embedded as a data URI in src/mcp/wrikeIcon.js).
  fastify.get("/favicon.ico", async (req, res) => {
    const base64 = wrikeIconDataUri.split(",")[1];
    res
      .type("image/x-icon")
      .header("Cache-Control", "public, max-age=86400")
      .send(Buffer.from(base64, "base64"));
  });

  // Generate redirect URL dynamically based on environment selection
  fastify.get("/get-redirect-url", async (req, res) => {
    const { environment, environmentId, redirectUri, accountId } = req.query;

    const { selectedEnvironment, redirectUrl } = findRedirectionURL(
      req.query,
      fastify,
    );

    res.send({ success: true, redirectUrl });
  });

  // Environment list + which one is currently selected, for the root
  // login page's dropdown (frontend/src/pages/RootLogin.tsx fetches this
  // client-side instead of it being server-injected into the HTML — see
  // frontend/src/lib/rootLoginApi.ts).
  fastify.get("/environments", async (req, res) => {
    const { selectedEnvironment } = findRedirectionURL(req.query, fastify);
    const visibleCreds = getCachedVisibleWrikeCredentials();
    const environments = Object.keys(visibleCreds || {});

    res.send({ success: true, environments, selectedEnvironment });
  });

  // View Handlers
  // Served from the React build (frontend/ -> public/app/, see
  // src/plugins/appStatic.js). autoRedirect is still handled server-side
  // with a raw 302 (must happen before any HTML/JS ever loads) — everything
  // else (environment list, initial redirect URL) is now fetched
  // client-side via /environments and /get-redirect-url instead of being
  // injected into the served HTML, same plain-sendFile pattern as every
  // other migrated page.
  fastify.get("/", async (req, res) => {
    const { autoRedirect } = req.query;

    if (autoRedirect == "true" || autoRedirect == "1") {
      const { redirectUrl } = findRedirectionURL(req.query, fastify);
      return res.redirect(redirectUrl);
    }

    return res.sendFile("root-login.html", process.cwd() + "/public/app");
  });

  // Run the server!
  fastify.listen(
    { port: process.env.PORT, host: "0.0.0.0" },
    function (err, address) {
      if (err) {
        fastify.log.error(err);
      }
      fastify.log.info(`Server listening on ${address}`);
    },
  );
})();
