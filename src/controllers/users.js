import models from "../../models";

export const Insert = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userData = await models.Users.create(data);
      resolve(userData);
    } catch (err) {
      reject(err);
    }
  });
};

export const GetByWrikeId = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userData = await models.Users.findOne({
        attributes: ["id"],
        where: { wrike_user_id: id },
      });
      resolve(userData);
    } catch (err) {
      reject(err);
    }
  });
};
