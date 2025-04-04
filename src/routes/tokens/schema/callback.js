export const WrikeXPICallbackSchema = {
  schema: {
    query: {
      type: "object",
      required: ["code"],
      properties: {
        code: { type: "string" },
      },
    },
  },
};
