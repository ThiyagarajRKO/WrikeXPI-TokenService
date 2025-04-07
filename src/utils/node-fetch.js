import fetch from "node-fetch";
import qs from "qs";

export const GetResponse = (url, method, headers, body) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!headers) {
        headers = {
          "content-type": "application/json",
        };
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body
          ? headers["content-type"] == "application/x-www-form-urlencoded"
            ? qs.stringify(body)
            : JSON.stringify(body)
          : null,
      });

      if (response.status == 204) {
        resolve({});
        return;
      }

      let data = await response.json();

      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
};
