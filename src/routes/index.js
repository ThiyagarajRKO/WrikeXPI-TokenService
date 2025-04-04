"use strict";

import { tokenRoute } from "./tokens";

// Auth Middleware
import { ValidateUser } from "../middlewares/authentication";

//Public Routes
export const PublicRouters = (fastify, opts, done) => {
  fastify.register(tokenRoute, { prefix: "/wrikexpi/token" });

  done();
};

//Protected Routes
export const PrivateRouters = (fastify, opts, done) => {
  // Validating session
  fastify.addHook("onRequest", ValidateUser);
  // fastify.use(ValidateUser);

  // fastify.register(logRoute, { prefix: "/kafka" });

  done();
};
