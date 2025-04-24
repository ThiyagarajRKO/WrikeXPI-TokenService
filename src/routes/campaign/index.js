import { GetCampaign } from "./handlers/getCampaign";

// Schema
import { GetCampaignSchema } from "./schema/getCampaign";

export const campaignRoute = (fastify, opts, done) => {
  fastify.get("/:campaignId", GetCampaignSchema, async (req, reply) => {
    try {
      const result = await GetCampaign(
        req?.wrikeToken,
        { ...req.params, ...req.query },
        fastify
      );

      reply.code(result.statusCode || 200).send({
        success: true,
        message: result.message,
        data: result?.data,
      });
    } catch (err) {
      reply.code(err?.statusCode || 500).send({
        success: false,
        message:
          err?.message ||
          "Fatal error Unexpected error occurred and service is unable complete the request.",
      });
    }
  });

  done();
};

export default campaignRoute;
