"use strict";

/**
 * OAuth discovery metadata for MCP clients (RFC 8414 authorization server
 * metadata + RFC 9728 protected resource metadata). Served at the host root
 * because MCP/OAuth clients always probe host-root `.well-known` paths first.
 *
 * These just describe where the actual endpoints live — see ./index.js for
 * /oauth/authorize, /oauth/token, /oauth/register, and src/plugins/mcp.js for
 * the protected /api/v1/wrikexpi/mcp resource itself.
 */
module.exports = async function (fastify, opts) {
  const appUrl = () => process.env.APP_URL || "http://localhost:3000";
  const mcpResourcePath = "/api/v1/wrikexpi/mcp";

  fastify.get("/.well-known/oauth-authorization-server", async (req, reply) => {
    const base = appUrl();
    reply.send({
      issuer: base,
      authorization_endpoint: `${base}/oauth/authorize`,
      token_endpoint: `${base}/oauth/token`,
      registration_endpoint: `${base}/oauth/register`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
    });
  });

  const protectedResourceMetadata = () => {
    const base = appUrl();
    return {
      resource: `${base}${mcpResourcePath}`,
      authorization_servers: [base],
    };
  };

  fastify.get("/.well-known/oauth-protected-resource", async (req, reply) => {
    reply.send(protectedResourceMetadata());
  });

  fastify.get(
    `/.well-known/oauth-protected-resource${mcpResourcePath}`,
    async (req, reply) => {
      reply.send(protectedResourceMetadata());
    },
  );
};
