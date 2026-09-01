"use strict";

const { v4: uuidv4 } = require("uuid");
const {
  StreamableHTTPServerTransport,
} = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { createMcpServer } = require("../mcp/index.js");
const { resolveAuth } = require("../mcp/tools/auth.js");

/**
 * Fastify plugin that exposes the MCP (Model Context Protocol) endpoint.
 *
 * Each POST request gets a fresh server + transport so multiple agents
 * can connect simultaneously. Auth is a bearer token on the HTTP
 * Authorization header (obtained via the MCP OAuth flow at /oauth/*),
 * resolved once per request and threaded into every tool — never a
 * tool-call parameter, so it never touches LLM context.
 *
 * POST /mcp                  – JSON-RPC MCP endpoint (environment picker on connect)
 * POST /mcp/:environmentId   – Same endpoint, pre-locked to one environment (no picker)
 * GET  /mcp[/:environmentId] – Health / readiness check
 */
module.exports = async function (fastify, opts) {
  const serverUrl = process.env.APP_URL || "http://localhost:3000";
  const baseResourceMetadataUrl = `${serverUrl}/.well-known/oauth-protected-resource/api/v1/wrikexpi/mcp`;

  const sendUnauthorized = (reply, description, resourceMetadataUrl) => {
    reply
      .code(401)
      .header(
        "WWW-Authenticate",
        `Bearer error="invalid_token", error_description="${description}", resource_metadata="${resourceMetadataUrl}"`,
      )
      .send({ error: "invalid_token", error_description: description });
  };

  // Shared POST handler for both /mcp and /mcp/:environmentId — auth
  // resolution and tool wiring are identical either way (the bearer token
  // already carries its own environment from when it was minted); only the
  // resource_metadata URL advertised on a 401 differs, so OAuth discovery
  // for the env-specific route points at env-specific authorize metadata
  // (see routes/oauth/wellKnown.js) instead of the generic picker flow.
  const handleMcpPost = (resourceMetadataUrl) => async (req, reply) => {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) {
      return sendUnauthorized(reply, "Authorization required", resourceMetadataUrl);
    }

    const auth = await resolveAuth(token);
    if (!auth) {
      return sendUnauthorized(reply, "Token is invalid or expired", resourceMetadataUrl);
    }

    if (typeof reply.hijack === "function") reply.hijack();

    try {
      // Ensure Accept header has both values required by the transport
      const accept = req.headers.accept || "";
      if (
        !accept.includes("text/event-stream") ||
        !accept.includes("application/json")
      ) {
        req.raw.headers.accept = "application/json, text/event-stream";
      }

      // Fresh server + transport per request — no shared session state
      const server = await createMcpServer(fastify, serverUrl, auth);
      const transport = new StreamableHTTPServerTransport({
        enableJsonResponse: true,
      });
      await server.connect(transport);
      await transport.handleRequest(req.raw, reply.raw, req.body);
    } catch (err) {
      const code = err?.statusCode || 500;
      reply.raw.writeHead(code, { "Content-Type": "application/json" });
      reply.raw.end(
        JSON.stringify({
          success: false,
          message: err?.message || "MCP request handling failed.",
        }),
      );
    }
  };

  fastify.post("/mcp", handleMcpPost(baseResourceMetadataUrl));
  fastify.post("/mcp/:environmentId", (req, reply) =>
    handleMcpPost(`${baseResourceMetadataUrl}/${req.params.environmentId}`)(req, reply),
  );

  // ── MCP GET health endpoint ──────────────────────────────────────
  fastify.get("/mcp", async (req, reply) => {
    reply.send({
      success: true,
      message: "WrikeXPI MCP endpoint is ready.",
      transport: "streamable-http",
      protocol: "Model Context Protocol",
    });
  });
  fastify.get("/mcp/:environmentId", async (req, reply) => {
    reply.send({
      success: true,
      message: `WrikeXPI MCP endpoint is ready (environment ${req.params.environmentId}).`,
      transport: "streamable-http",
      protocol: "Model Context Protocol",
    });
  });
};
