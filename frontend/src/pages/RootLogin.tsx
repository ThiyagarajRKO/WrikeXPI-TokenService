import { useEffect, useState } from "react";
import { fetchRedirectUrl, getInit } from "../lib/rootLoginApi";
import "./RootLogin.css";

// Faithful React port of the inline HTML in src/index.js's GET / handler.
// Initial environment list / selected env / redirect URL are computed
// server-side (findRedirectionURL) exactly as before and injected as
// window.__ROOT_LOGIN_INIT__ — this page only replicates the client-side
// dropdown/redirect interactivity, now state-driven instead of manual DOM.
export default function RootLogin() {
  const init = getInit();
  const [environment, setEnvironment] = useState(init.selectedEnvironment);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset button if the browser restores this page from bfcache after a redirect.
    const onPageShow = () => setLoading(false);
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const handleLogin = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (init.environments.length === 0) {
      alert(
        "No environments configured. Please contact your administrator to configure Wrike environments.",
      );
      return;
    }
    if (!environment) {
      alert("Please select an environment from the dropdown to proceed.");
      return;
    }

    setLoading(true);

    const redirectUrl =
      (await fetchRedirectUrl({
        environment,
        redirectUri: init.redirectUri,
        accountId: init.accountId,
      })) || init.redirectUrl;

    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 600);
  };

  return (
    <>
      <div className="top-nav">
        <a href="/docs/mcp">MCP Docs</a>
        <a href="/docs/api">API Docs</a>
      </div>

      <div className="card">
        <div className="logo">
          <span>W</span>
        </div>
        <h1>Connect Your Wrike Account</h1>

        <div className="env-select-wrapper">
          <label htmlFor="envSelect" className="env-select-label">
            Choose Environment
          </label>
          <select
            id="envSelect"
            className="env-select"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
          >
            {init.environments.map((env) => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </select>
        </div>

        <p>To continue, please log in using your Wrike credentials.</p>
        <a href={init.redirectUrl} className="button" onClick={handleLogin}>
          {loading ? (
            <div className="loader" />
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M10 17l5-5-5-5v10z" />
              </svg>
              <span>Login with Wrike</span>
            </>
          )}
        </a>

        <p style={{ marginTop: 30, marginBottom: 0, fontSize: "0.95rem", color: "#dddddd" }}>
          Do you want to verify your token?
          <a
            href="/api/v1/wrikexpi/token/evaluate"
            className="secondary-link"
            style={{ color: "#9ae6b4", fontWeight: 600, textDecoration: "underline", marginLeft: 4 }}
          >
            Click here
          </a>
        </p>

        <p style={{ marginTop: 10, marginBottom: 0, fontSize: "0.95rem", color: "#dddddd" }}>
          Want to see all your tokens?
          <a
            href="/api/v1/wrikexpi/token/view"
            className="secondary-link"
            style={{ color: "#9ae6b4", fontWeight: 600, textDecoration: "underline", marginLeft: 4 }}
          >
            View Tokens
          </a>
        </p>
      </div>
    </>
  );
}
