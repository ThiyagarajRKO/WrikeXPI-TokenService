export const GetUserProfileSchema = {
  schema: {
    body: {
      type: "object",
      required: ["token"],
      properties: {
        token: { type: "string" },
      },
    },
  },
};
