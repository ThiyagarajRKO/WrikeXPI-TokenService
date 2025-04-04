export const tokenRoute = (fastify, opts, done) => {
  fastify.get("/callback", async (req, reply) => {
    try {
      console.log(JSON.stringify(req.query, null, 4));
      reply.code(200).send({
        success: true,
        message: "",
        data: null,
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
