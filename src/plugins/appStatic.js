"use strict";

const fp = require("fastify-plugin");

/**
 * Dedicated static mount for the React frontend (frontend/, built via Vite
 * into public/app/ — see frontend/vite.config.ts). Shared by every migrated
 * section (admin/*, portal/*, ...) — each backend route serves its own HTML
 * entry (e.g. reply.sendFile("admin-login.html", ...)) but all reference
 * hashed JS/CSS assets under this one /app/ prefix. Separate from the
 * generic static plugin (static.js) so this app's build output stays
 * self-contained. `decorateReply: false` avoids redeclaring the
 * `sendFile`/`download` reply decorators the generic plugin already adds at
 * the root scope (@fastify/static errors if the same decorator is added
 * twice in the same encapsulation chain).
 */
module.exports = fp(async function (fastify, opts) {
  fastify.register(require("@fastify/static"), {
    root: process.cwd() + "/public/app/",
    prefix: "/app/",
    decorateReply: false,
    maxAge: 2592000,
  });
});
