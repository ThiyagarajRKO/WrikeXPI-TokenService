import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCampaignTools } from "./tools/campaign.js";
import { registerChannelTools } from "./tools/channel.js";
import { registerTaskTools } from "./tools/task.js";
import { registerDatahubTools } from "./tools/datahub.js";

/**
 * Create a fully-configured MCP server with all tools registered.
 * Authentication is resolved once per HTTP request (bearer token, see
 * src/plugins/mcp.js) and passed in as `auth` — tools no longer accept
 * an auth_token parameter of their own.
 *
 * @param {object} fastify - Fastify instance
 * @param {string} serverUrl - Base URL for auth error messages
 * @param {{wrikeToken: string, environmentName: string}} auth - Resolved auth for this request
 * @returns {McpServer}
 */
export const createMcpServer = (fastify, serverUrl, auth) => {
  const server = new McpServer(
    {
      name: "wrikexpi-mcp",
      title: "WrikeXPI",
      version: "1.0.0",
      description: "Manage Wrike XPI campaigns, channels, tasks, and Datahub fields.",
      websiteUrl: serverUrl,
      icons: [
        {
          src: "https://cdn.wrike.com/static/branding/wrike/favicons/favicon.ico",
          mimeType: "image/x-icon",
        },
      ],
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  registerCampaignTools(server, fastify, serverUrl, auth);
  registerChannelTools(server, serverUrl, auth);
  registerTaskTools(server, serverUrl, auth);
  registerDatahubTools(server, serverUrl, auth);

  return server;
};
