import models from "../../models";

export const Insert = (profile_id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userTokens = await models.UserTokens.create(data, {
        profile_id,
      });
      resolve(userTokens);
    } catch (err) {
      reject(err);
    }
  });
};

export const Update = (profile_id, id, user_token_data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!profile_id) {
        return reject({
          statusCode: 420,
          message: "user Token Id must not be empty!",
        });
      }

      const userTokens = await models.UserTokens.update(user_token_data, {
        where: {
          id,
          is_active: true,
        },
        individualHooks: true,
        profile_id,
      });
      resolve(userTokens);
    } catch (err) {
      reject(err);
    }
  });
};

export const GetByUserId = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        return reject({
          statusCode: 420,
          message: "Id must not be empty!",
        });
      }

      const userTokens = await models.UserTokens.findOne({
        attributes: ["id", "encrypted_access_token", "encrypted_refresh_token"],
        where: {
          created_by: id,
          is_active: true,
        },
      });
      resolve({
        id: userTokens?.id,
        encrypted_access_token: userTokens?.encrypted_access_token,
        encrypted_refresh_token: userTokens?.encrypted_refresh_token,
      });
    } catch (err) {
      reject(err);
    }
  });
};

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
