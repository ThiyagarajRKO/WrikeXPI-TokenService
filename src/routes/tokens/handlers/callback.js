import { GetResponse } from "../../../utils/node-fetch";

export const WrikeXPICallback = ({ code }) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!code) return reject({ message: "Access Token must not be empty" });

      const wrikeTokenData = await getWrikeTokens();

      // Sending final response
      resolve({ data: wrikeTokenData });
    } catch (err) {
      console.log(err?.message || err);
      reject(err);
    }
  });
};

const getWrikeTokens = async () => {
  try {
    console.log(process.env.WRIKE_ENDPOINT);

    const url = `${process.env.WRIKE_ENDPOINT}`;

    await GetResponse(url, "POSt", null);
    return;
  } catch (err) {
    console.log(err?.message ?? err);
    return null;
  }
};
