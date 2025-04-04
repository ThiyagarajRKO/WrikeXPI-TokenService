import { WrikeXPICallback } from "./handlers/callback";

import { WrikeXPICallbackSchema } from "./schema/callback";

export const tokenRoute = (fastify, opts, done) => {
  fastify.get("/", async (req, reply) => {
    try {
      const { WRIKE_LOGIN_ENDPOINT, WRIKE_CLIENT_ID } = process.env;

      if (!WRIKE_LOGIN_ENDPOINT || !WRIKE_CLIENT_ID) {
        throw new Error(
          "Missing WRIKE_LOGIN_ENDPOINT or WRIKE_CLIENT_ID in environment variables"
        );
      }

      const redirectUrl = `${WRIKE_LOGIN_ENDPOINT}?client_id=${WRIKE_CLIENT_ID}&response_type=code`;

      return reply.redirect(redirectUrl);
    } catch (err) {
      console.log(err?.message ?? err);
      reply.code(err?.statusCode || 400).send({
        success: false,
        message: err?.message || err,
      });
    }
  });

  fastify.get("/callback", WrikeXPICallbackSchema, async (req, reply) => {
    try {
      const result = await WrikeXPICallback(req.query);

      reply.code(200).send({
        success: true,
        message: result?.message,
        data: result?.data,
      });
    } catch (err) {
      reply.code(err?.statusCode || 400).send({
        success: false,
        message: err?.message || err,
      });
    }
  });

  done();
};

export default tokenRoute;
