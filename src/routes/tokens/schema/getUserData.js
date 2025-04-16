export const GetUserDataSchema = {
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
