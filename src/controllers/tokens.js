import models from "../../models";

export const GetAll = ({ limit = 10, offset = 0 }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userTokens = await models.UserTokensTokens.findAll({
        limit,
        offset,
      });
      resolve(userTokens);
    } catch (err) {
      reject(err);
    }
  });
};
