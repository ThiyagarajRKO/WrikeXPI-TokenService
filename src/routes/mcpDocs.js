"use strict";

const {
  getCachedVisibleWrikeCredentials,
} = require("../utils/wrikeCredentials");

/**
 * Human-facing documentation page explaining how to connect an MCP client
 * (Claude Desktop, Claude.ai, mcp-remote, MCP Inspector, ...) to this
 * server's MCP endpoint, with copy-able URLs for the generic (environment
 * picker) connection and one per configured Wrike environment.
 *
 * GET /mcp-docs
 */
module.exports = async function (fastify, opts) {
  fastify.get("/mcp-docs", async (req, reply) => {
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const baseMcpUrl = `${appUrl}/api/v1/wrikexpi/mcp`;

    const visibleCreds = getCachedVisibleWrikeCredentials();
    const envCards = Object.entries(visibleCreds || {})
      .map(([envName, envData]) => {
        const url = `${baseMcpUrl}/${envData.id}`;
        const id = `url-${envData.id}`;
        return `
              <div class="env-card">
                <div class="env-card-head">
                  <span class="env-dot"></span>
                  <span class="env-name">${envName}</span>
                </div>
                ${urlRow(id, url)}
              </div>`;
      })
      .join("");

    function urlRow(id, url) {
      return `
                <div class="url-row">
                  <code id="${id}">${url}</code>
                  <button class="copy-btn" onclick="copyUrl('${id}', this)" aria-label="Copy URL">
                    <svg class="icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    <svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" hidden><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span class="copy-label">Copy</span>
                  </button>
                </div>`;
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Connect an MCP Client</title>
  <link rel="icon" href="https://cdn.wrike.com/static/branding/wrike/favicons/favicon.ico">
  <style>
    :root {
      --bg-1: #14121f;
      --bg-2: #1c1830;
      --surface: rgba(255, 255, 255, 0.045);
      --surface-2: rgba(255, 255, 255, 0.07);
      --border: rgba(255, 255, 255, 0.10);
      --border-soft: rgba(255, 255, 255, 0.07);
      --text: #f1f0f6;
      --text-dim: #a3a0b8;
      --text-faint: #7b7893;
      --accent: #6ee7a8;
      --accent-strong: #34d399;
      --mono: 'SF Mono', 'Cascadia Code', Consolas, monospace;
      --sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    html { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.18) transparent; }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.14); border-radius: 8px; border: 2px solid transparent; background-clip: padding-box; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.24); background-clip: padding-box; }

    body {
      font-family: var(--sans);
      min-height: 100vh;
      background:
        radial-gradient(1100px 520px at 12% -8%, rgba(110, 231, 168, 0.10), transparent 60%),
        radial-gradient(900px 480px at 88% 8%, rgba(147, 141, 214, 0.14), transparent 55%),
        linear-gradient(180deg, var(--bg-1), var(--bg-2));
      color: var(--text);
      padding: 56px 20px 80px;
    }

    .wrap { max-width: 760px; margin: 0 auto; }

    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
    }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 600; letter-spacing: 0.2px; color: var(--text); font-size: 0.95rem; }
    .brand-mark {
      width: 26px; height: 26px; border-radius: 8px;
      background: linear-gradient(135deg, var(--accent), #4f9dde);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 800; color: #0c1c14;
    }
    .top-nav a {
      color: var(--text-dim);
      text-decoration: none;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: color 0.15s ease;
    }
    .top-nav a:hover { color: var(--text); }

    .hero {
      margin-bottom: 32px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      background: rgba(110, 231, 168, 0.12);
      color: var(--accent);
      border: 1px solid rgba(110, 231, 168, 0.25);
      padding: 5px 12px;
      border-radius: 999px;
      margin-bottom: 18px;
    }
    h1 {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }
    .hero p {
      font-size: 1rem;
      color: var(--text-dim);
      line-height: 1.65;
      max-width: 58ch;
    }
    .hero code.inline {
      background: rgba(255,255,255,0.08);
      padding: 2px 7px;
      border-radius: 5px;
      font-family: var(--mono);
      font-size: 0.85em;
      color: #d9d6ee;
    }

    .steps {
      list-style: none;
      display: grid;
      gap: 14px;
      margin: 28px 0 0;
    }
    .step {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }
    .step-num {
      flex-shrink: 0;
      width: 26px; height: 26px;
      border-radius: 50%;
      background: var(--surface-2);
      border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 700; color: var(--accent);
    }
    .step p {
      font-size: 0.92rem;
      color: var(--text-dim);
      line-height: 1.55;
      padding-top: 2px;
    }

    .section {
      margin-top: 40px;
    }
    .section-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .section-head h2 {
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-faint);
    }
    .section-head .hint {
      font-size: 0.8rem;
      color: var(--text-faint);
    }

    .panel {
      background: var(--surface);
      border: 1px solid var(--border-soft);
      border-radius: 16px;
      padding: 6px;
    }

    .url-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 12px;
      transition: background 0.15s ease;
    }
    .url-row:hover { background: rgba(255,255,255,0.03); }

    .url-row code {
      flex: 1;
      font-family: var(--mono);
      font-size: 0.83rem;
      color: #d4d2e6;
      line-height: 1.5;
      word-break: break-all;
      overflow-wrap: anywhere;
    }

    .copy-btn {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: var(--sans);
      font-weight: 600;
      font-size: 0.8rem;
      padding: 7px 12px;
      border-radius: 9px;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }
    .copy-btn:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.22); }
    .copy-btn.copied { background: rgba(110, 231, 168, 0.16); border-color: rgba(110, 231, 168, 0.4); color: var(--accent); }
    .icon-copy, .icon-check { width: 14px; height: 14px; }
    .copy-btn.copied .icon-copy { display: none; }
    .copy-btn.copied .icon-check { display: inline-block !important; }

    .env-grid {
      display: grid;
      gap: 10px;
    }
    .env-card {
      background: var(--surface);
      border: 1px solid var(--border-soft);
      border-radius: 16px;
      padding: 6px;
    }
    .env-card-head {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px 2px;
    }
    .env-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--accent-strong);
      box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.18);
    }
    .env-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text);
    }

    .footnote {
      margin-top: 36px;
      font-size: 0.8rem;
      color: var(--text-faint);
      line-height: 1.6;
      border-top: 1px solid var(--border-soft);
      padding-top: 20px;
    }

    @media (max-width: 520px) {
      h1 { font-size: 1.6rem; }
      .copy-label { display: none; }
      .copy-btn { padding: 8px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top-nav">
      <div class="brand">
        <span class="brand-mark">W</span>
        <span>WrikeXPI</span>
      </div>
      <a href="${appUrl}/">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        Back to login
      </a>
    </div>

    <div class="hero">
      <span class="badge">No copy-paste tokens</span>
      <h1>Connect an MCP Client</h1>
      <p>
        This server exposes a Model Context Protocol (MCP) endpoint that any MCP-compliant
        client — Claude Desktop, Claude.ai Connectors, <code class="inline">mcp-remote</code>,
        MCP Inspector — can connect to directly. Authentication runs through a standard
        OAuth flow the client handles automatically: no token to copy, paste, or re-enter.
      </p>

      <ol class="steps">
        <li class="step"><span class="step-num">1</span><p>Copy one of the URLs below.</p></li>
        <li class="step"><span class="step-num">2</span><p>Add it as a remote / custom MCP server in your client.</p></li>
        <li class="step"><span class="step-num">3</span><p>Your client opens a browser window for Wrike login — plus an environment picker, unless you used an environment-specific URL.</p></li>
        <li class="step"><span class="step-num">4</span><p>Once approved, the client attaches the token to every request automatically.</p></li>
      </ol>
    </div>

    <div class="section">
      <div class="section-head">
        <h2>Generic connection</h2>
        <span class="hint">choose environment at login</span>
      </div>
      <div class="panel">
        ${urlRow("url-generic", baseMcpUrl)}
      </div>
    </div>

    ${
      envCards
        ? `<div class="section">
      <div class="section-head">
        <h2>Environment-specific connections</h2>
        <span class="hint">skips the picker</span>
      </div>
      <div class="env-grid">
        ${envCards}
      </div>
    </div>`
        : ""
    }

    <p class="footnote">
      Discovery metadata lives at <code class="inline" style="font-size:0.78em">/.well-known/oauth-authorization-server</code> —
      most MCP clients find everything else automatically once you paste a URL above.
    </p>
  </div>

  <script>
    function copyUrl(id, btn) {
      const text = document.getElementById(id).innerText;
      navigator.clipboard.writeText(text).then(() => {
        btn.classList.add("copied");
        const label = btn.querySelector(".copy-label");
        const prevLabel = label ? label.textContent : "";
        if (label) label.textContent = "Copied";
        setTimeout(() => {
          btn.classList.remove("copied");
          if (label) label.textContent = prevLabel;
        }, 1800);
      });
    }
  </script>
</body>
</html>`;

    reply.type("text/html").send(html);
  });
};
