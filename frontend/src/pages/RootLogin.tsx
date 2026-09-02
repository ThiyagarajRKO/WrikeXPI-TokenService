import { useEffect, useState } from "react";
import { fetchEnvironments, fetchRedirectUrl } from "../lib/rootLoginApi";
import SearchableSelect from "../components/SearchableSelect";
import "./RootLogin.css";

// Faithful React port of the inline HTML in src/index.js's GET / handler.
// Environment list / selected env / initial redirect URL are fetched
// client-side (GET /environments, GET /get-redirect-url) instead of being
// server-injected — redirectUri/accountId are plain pass-through query
// params, read straight from the current URL, same as any other page.
const searchParams = new URLSearchParams(window.location.search);
const initialRedirectUri = searchParams.get("redirectUri") || "";
const initialAccountId = searchParams.get("accountId") || "";

export default function RootLogin() {
  const [environments, setEnvironments] = useState<string[]>([]);
  const [environment, setEnvironment] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [envLoading, setEnvLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchEnvironments().then(async (init) => {
      if (cancelled) return;
      setEnvironments(init.environments);
      setEnvironment(init.selectedEnvironment);
      setEnvLoading(false);

      const url = await fetchRedirectUrl({
        environment: init.selectedEnvironment,
        redirectUri: initialRedirectUri,
        accountId: initialAccountId,
      });
      if (!cancelled && url) setRedirectUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Reset button if the browser restores this page from bfcache after a redirect.
    const onPageShow = () => setLoading(false);
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const handleLogin = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (environments.length === 0) {
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

    const url =
      (await fetchRedirectUrl({
        environment,
        redirectUri: initialRedirectUri,
        accountId: initialAccountId,
      })) || redirectUrl;

    setTimeout(() => {
      window.location.href = url;
    }, 600);
  };

  return (
    <div className="root-login-page">
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
          <SearchableSelect
            id="envSelect"
            options={environments}
            value={environment}
            onChange={setEnvironment}
            disabled={envLoading}
            placeholder="Search environments…"
          />
        </div>

        <p>To continue, please log in using your Wrike credentials.</p>
        <a href={redirectUrl} className="button" onClick={handleLogin}>
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
    </div>
  );
}
