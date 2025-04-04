import { produce } from "../../../utils/kafka";

export const Produce = (c2cType, environment, payload, fastify) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!payload) return reject({ message: "Payload must not be empty" });

      await produce(`c2c-webhook-${environment?.toLowerCase()}`, {
        c2cType,
        environment: environment?.toUpperCase(),
        inputParams: payload,
        logType: "webhook",
      });

      // Sending final response
      resolve({ message: "Message successfully send!" });
    } catch (err) {
      console.log(err?.message || err);
      reject(err);
    }
  });
};
