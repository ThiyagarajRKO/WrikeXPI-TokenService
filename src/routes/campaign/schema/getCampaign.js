export const GetCampaignSchema = {
  schema: {
    params: {
      type: "object",
      required: ["campaignId"],
      properties: {
        campaignId: { type: "string" },
      },
    },
    query: {
      type: "object",
      required: ["filter"],
      properties: {
        filter: { type: "string" },
      },
    },
  },
};
