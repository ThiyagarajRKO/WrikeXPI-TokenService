import { WrikeXPICallback } from "./handlers/callback";

import { WrikeXPICallbackSchema } from "./schema/callback";

export const tokenRoute = (fastify, opts, done) => {
  fastify.get("/callback", WrikeXPICallbackSchema, async (req, reply) => {
    try {
      const token = await WrikeXPICallback(req.query, fastify);

      if (!token) {
        return reply.code(200).send({
          success: true,
          message: result?.message,
          data: result?.data,
        });
      }

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>WrikeXPI Secure Token</title>
  <style>
    :root {
      --accent: #4CAF50;
      --bg-blur: rgba(255, 255, 255, 0.06);
      --border-light: rgba(255, 255, 255, 0.15);
      --text-subtle: #cccccc;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(-45deg, #1f1c2c, #928dab, #2e2e52, #515175);
      background-size: 400% 400%;
      animation: gradient 15s ease infinite;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .card {
      backdrop-filter: blur(20px);
      background-color: var(--bg-blur);
      border: 1px solid var(--border-light);
      border-radius: 24px;
      padding: 50px 40px;
      max-width: 760px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
      animation: popIn 0.7s ease-out;
      transform-origin: center;
    }

    @keyframes popIn {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .card h1 {
      font-size: 1.9rem;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .card h1 svg {
      width: 28px;
      height: 28px;
      fill: var(--accent);
    }

    .token-box {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 20px;
      border-radius: 12px;
      font-family: monospace;
      font-size: 0.9rem;
      color: #e0e0e0;
      text-align: left;
      max-height: 300px;
      overflow-y: auto;
      word-wrap: break-word;
      transition: box-shadow 0.3s ease;
    }

    .token-box:hover {
      box-shadow: 0 0 0 2px var(--accent);
    }

    .copy-btn {
      margin-top: 25px;
      background: var(--accent);
      border: none;
      padding: 14px 24px;
      border-radius: 10px;
      color: white;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .copy-btn:hover {
      background: #3da543;
      transform: translateY(-1px);
    }

    .success-msg {
      margin-top: 14px;
      font-size: 0.9rem;
      color: #90ee90;
      display: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>WrikeXPI Secure Token</h1>
    <div class="token-box" id="tokenBox">${token}</div>
    <button class="copy-btn" onclick="copyToken()">Copy to Clipboard</button>
    <div class="success-msg" id="successMsg">Token copied to clipboard ✅</div>
  </div>

  <script>
    function copyToken() {
      const token = document.getElementById("tokenBox").innerText;
      navigator.clipboard.writeText(token).then(() => {
        const msg = document.getElementById("successMsg");
        msg.style.display = "block";
        setTimeout(() => {
          msg.style.display = "none";
        }, 2500);
      });
    }
  </script>
</body>
</html>
`;

      reply.type("text/html").send(html);
    } catch (err) {
      // reply.code(err?.statusCode || 400).send({
      //   success: false,
      //   message: err?.message || err,
      // });

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Error</title>
  <style>
    :root {
      --accent: #ff5252;
      --bg-blur: rgba(255, 255, 255, 0.06);
      --border-light: rgba(255, 255, 255, 0.15);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(-45deg, #1f1c2c, #928dab, #2e2e52, #515175);
      background-size: 400% 400%;
      animation: gradient 15s ease infinite;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .card {
      backdrop-filter: blur(20px);
      background-color: var(--bg-blur);
      border: 1px solid var(--border-light);
      border-radius: 24px;
      padding: 40px 30px;
      max-width: 600px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: fadeIn 0.7s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .card h1 {
      font-size: 1.8rem;
      margin-bottom: 10px;
      color: var(--accent);
    }

    .message {
      font-size: 1rem;
      color: #ddd;
      margin: 16px 0 28px;
    }

    .btn {
      background: var(--accent);
      border: none;
      padding: 12px 20px;
      border-radius: 10px;
      color: white;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: background 0.3s ease;
    }

    .btn:hover {
      background: #e64a4a;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Oops! Something went wrong</h1>
    <div class="message">${err?.message || "Unexpected error occurred"}</div>
    <a class="btn" href="/">⬅ Back to Login</a>
  </div>
</body>
</html>
`;

      reply
        .code(err?.statusCode || 400)
        .type("text/html")
        .send(html);
    }
  });

  done();
};

export default tokenRoute;
