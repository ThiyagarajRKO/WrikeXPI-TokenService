"use strict";

// Importing Modules to Start Server
import AutoLoad from "@fastify/autoload";
import path from "path";
import Fastify from "fastify";
import dotenv from "dotenv";
dotenv.config();

// Importing Routes
import { PrivateRouters, PublicRouters } from "./routes";

// Configure the framework and instantiate it
const fastify = Fastify({
  logger: true,
});

// app.use(express.static("public"));
// app.set("view engine", "ejs");

// This loads all plugins defined in plugins those should be support plugins that are reused through your application
fastify.register(AutoLoad, {
  dir: path.join(process.cwd(), "/src/plugins"),
});

// fastify.get("/", (req, res) => {
//   res.code(200).send({ message: "Server is running..." });
// });

//routes
fastify.register(PublicRouters, { prefix: "/api/v1" });
fastify.register(PrivateRouters, { prefix: "/api/v1" });

// Run the server!
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
    }
    fastify.log.info(`Server listening on ${address}`);
  }
);

// Hooks

fastify.addHook("onError", async (request, reply, error) => {
  console.log(new Date() + " : " + error?.message || error);
  reply.code(500).send({ success: false, message: error?.message || error });
});

fastify.addHook("onSend", function (request, reply, payload, done) {
  try {
    if (!reply.sent && payload) {
      done(null, payload);
    }
  } catch (err) {
    console.error(new Date().toISOString() + " : " + err?.message || err);
  }
});

// View Handlers
fastify.get("/", (req, res) => {
  const { WRIKE_LOGIN_ENDPOINT, WRIKE_CLIENT_ID } = process.env;

  if (!WRIKE_LOGIN_ENDPOINT || !WRIKE_CLIENT_ID) {
    throw new Error(
      "Missing WRIKE_LOGIN_ENDPOINT or WRIKE_CLIENT_ID in environment variables"
    );
  }

  const redirectUrl = `${WRIKE_LOGIN_ENDPOINT}?client_id=${WRIKE_CLIENT_ID}&response_type=code`;

  const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Connect to Wrike</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', sans-serif;
            height: 100vh;
            background: linear-gradient(-45deg, #1f1c2c, #928dab, #2e2e52, #515175);
            background-size: 400% 400%;
            animation: gradient 15s ease infinite;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
          }

          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .card {
            backdrop-filter: blur(16px);
            background-color: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 24px;
            padding: 50px 40px;
            box-shadow: 0 16px 48px rgba(0,0,0,0.2);
            max-width: 400px;
            width: 90%;
            text-align: center;
            animation: fadeIn 1s ease-out forwards;
            opacity: 0;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .logo {
            width: 60px;
            height: 60px;
            background: #ffffff22;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
          }

          .logo span {
            font-size: 24px;
            font-weight: bold;
          }

          h1 {
            font-size: 1.8rem;
            margin-bottom: 12px;
          }

          p {
            font-size: 0.95rem;
            color: #cccccc;
            margin-bottom: 30px;
          }

          a.button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 14px 26px;
            font-size: 1rem;
            font-weight: 600;
            color: white;
            background: #4CAF50;
            border: none;
            border-radius: 12px;
            text-decoration: none;
            cursor: pointer;
            transition: background 0.3s ease, transform 0.2s ease;
          }

          a.button:hover {
            background: #45a049;
            transform: translateY(-2px);
          }

          a.button svg {
            width: 20px;
            height: 20px;
            fill: white;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo"><span>W</span></div>
          <h1>Connect Your Wrike Account</h1>
          <p>To continue, please log in using your Wrike credentials.</p>
          <a href="${redirectUrl}" class="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"/></svg>
            Login with Wrike
          </a>
        </div>
      </body>
      </html>
    `;

  res.type("text/html").send(html);

  // res.send({ message: "WrikeXPI Token Service server is running..." });
});
