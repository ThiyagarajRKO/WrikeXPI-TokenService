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

  // `issuer` + `authorization_endpoint` for the generic (picker) flow, or for
  // a specific environment when `environmentId` is given — per RFC 8414's
  // path-based-issuer convention, a per-env issuer of "{base}/env/{id}" is
  // discoverable at "{base}/.well-known/oauth-authorization-server/env/{id}".
  // The env-specific authorization_endpoint has `environment_id` baked in as
  // a fixed query param, which MCP clients merge with their own OAuth params
  // (response_type, client_id, code_challenge, ...) rather than overwrite —
  // that's what lets /oauth/authorize skip the environment picker.
  const authServerMetadata = (environmentId) => {
    const base = appUrl();
    const issuer = environmentId ? `${base}/env/${environmentId}` : base;
    const authorizeQuery = environmentId
      ? `?environment_id=${encodeURIComponent(environmentId)}`
      : "";
    return {
      issuer,
      authorization_endpoint: `${base}/oauth/authorize${authorizeQuery}`,
      token_endpoint: `${base}/oauth/token`,
      registration_endpoint: `${base}/oauth/register`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
    };
  };

  fastify.get("/.well-known/oauth-authorization-server", async (req, reply) => {
    reply.send(authServerMetadata());
  });

  fastify.get(
    "/.well-known/oauth-authorization-server/env/:environmentId",
    async (req, reply) => {
      reply.send(authServerMetadata(req.params.environmentId));
    },
  );

  const protectedResourceMetadata = (resourcePath, environmentId) => {
    const base = appUrl();
    return {
      resource: `${base}${resourcePath}`,
      authorization_servers: [environmentId ? `${base}/env/${environmentId}` : base],
    };
  };

  fastify.get("/.well-known/oauth-protected-resource", async (req, reply) => {
    reply.send(protectedResourceMetadata(mcpResourcePath));
  });

  fastify.get(
    `/.well-known/oauth-protected-resource${mcpResourcePath}`,
    async (req, reply) => {
      reply.send(protectedResourceMetadata(mcpResourcePath));
    },
  );

  fastify.get(
    `/.well-known/oauth-protected-resource${mcpResourcePath}/:environmentId`,
    async (req, reply) => {
      const { environmentId } = req.params;
      reply.send(
        protectedResourceMetadata(`${mcpResourcePath}/${environmentId}`, environmentId),
      );
    },
  );
};
