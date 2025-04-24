"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  fastify.register(require("@fastify/rate-limit"), {
    max:
      process.env.RATE_LIMIT && typeof process.env.RATE_LIMIT == "string"
        ? parseInt(process.env.RATE_LIMIT)
        : 120,
    timeWindow: process.env.RATE_LIMIT_TIME,
    allowList: (req) => req.url.startsWith("/public"),
    errorResponseBuilder: function (request, context) {
      return {
        statusCode: 429,
        message: `Rate limit exceeded for WrikeXPI, please try again later or contact integration team.`,
      };
    },
  });
});
