import { WrikeXPICallback } from "./handlers/callback";

import { WrikeXPICallbackSchema } from "./schema/callback";

export const tokenRoute = (fastify, opts, done) => {
  fastify.get("/callback", WrikeXPICallbackSchema, async (req, reply) => {
    try {
      const result = await WrikeXPICallback(req.query, fastify);

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
